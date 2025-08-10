#!/usr/bin/env python3
"""
Glyph Table Analyzer using fontTools ttx
Extracts and compares glyph tables from Segoe UI fonts
"""

import os
import subprocess
import json
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, List, Set, Tuple
import argparse


class GlyphAnalyzer:
    def __init__(self, workspace_path: str = "."):
        self.workspace_path = Path(workspace_path)
        self.ttx_output_dir = Path("ttx_output")
        self.ttx_output_dir.mkdir(exist_ok=True)

    def extract_ttx(self, font_path: str) -> str:
        """Extract font to TTX format using fontTools"""
        font_name = Path(font_path).stem
        output_file = self.ttx_output_dir / f"{font_name}.ttx"

        try:
            # Run ttx command
            cmd = ["ttx", "-o", str(output_file), font_path]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)

            print(f"+ Extracted {font_name} to {output_file}")
            return str(output_file)

        except subprocess.CalledProcessError as e:
            print(f"- Error extracting {font_name}: {e}")
            print(f"stderr: {e.stderr}")
            return None
        except FileNotFoundError:
            print("- ttx command not found. Install fontTools: pip install fonttools")
            return None

    def extract_all_fonts(self) -> Dict[str, str]:
        """Extract all fonts to TTX format"""
        font_groups = self.discover_fonts()
        ttx_files = {}

        for group_name, font_files in font_groups.items():
            print(f"Extracting fonts from {group_name}...")
            ttx_files[group_name] = {}

            for font_path in font_files:
                ttx_file = self.extract_ttx(font_path)
                if ttx_file:
                    font_name = Path(font_path).stem
                    ttx_files[group_name][font_name] = ttx_file

        return ttx_files

    def discover_fonts(self) -> Dict[str, List[str]]:
        """Discover all TTF fonts in the workspace"""
        font_groups = {}

        for folder in self.workspace_path.iterdir():
            if folder.is_dir():
                font_files = []
                for file in folder.glob("*.ttf"):
                    font_files.append(str(file))
                if font_files:
                    font_groups[folder.name] = font_files

        return font_groups

    def analyze_cmap_table(self, ttx_file: str) -> Dict:
        """Analyze the cmap table from TTX file"""
        try:
            tree = ET.parse(ttx_file)
            root = tree.getroot()

            # Find cmap table
            cmap_elem = root.find(".//cmap")
            if cmap_elem is None:
                return {"error": "No cmap table found"}

            # Extract format 4 cmap (most common for Unicode)
            format4_cmap = cmap_elem.find(".//cmap_format_4")
            if format4_cmap is None:
                return {"error": "No format 4 cmap found"}

            # Extract character mappings
            char_mappings = {}
            for map_elem in format4_cmap.findall(".//map"):
                code = map_elem.get("code")
                name = map_elem.get("name")
                if code and name:
                    char_mappings[int(code, 16)] = name

            return {
                "total_mappings": len(char_mappings),
                "char_mappings": char_mappings,
                "unicode_ranges": self._group_unicode_ranges(char_mappings.keys()),
            }

        except Exception as e:
            return {"error": str(e)}

    def analyze_name_table(self, ttx_file: str) -> Dict:
        """Analyze the name table from TTX file"""
        try:
            tree = ET.parse(ttx_file)
            root = tree.getroot()

            # Find name table
            name_elem = root.find(".//name")
            if name_elem is None:
                return {"error": "No name table found"}

            # Extract name records
            names = {}
            for namerecord in name_elem.findall(".//namerecord"):
                nameID = namerecord.get("nameID")
                platformID = namerecord.get("platformID")
                platEncID = namerecord.get("platEncID")
                langID = namerecord.get("langID")
                text = namerecord.text

                if nameID and text:
                    key = f"{nameID}_{platformID}_{platEncID}_{langID}"
                    names[key] = {
                        "nameID": nameID,
                        "platformID": platformID,
                        "platEncID": platEncID,
                        "langID": langID,
                        "text": text,
                    }

            return {"names": names}

        except Exception as e:
            return {"error": str(e)}

    def analyze_glyf_table(self, ttx_file: str) -> Dict:
        """Analyze the glyf table from TTX file"""
        try:
            tree = ET.parse(ttx_file)
            root = tree.getroot()

            # Find glyf table
            glyf_elem = root.find(".//glyf")
            if glyf_elem is None:
                return {"error": "No glyf table found"}

            # Count glyphs by type
            glyph_types = {"simple": 0, "composite": 0, "empty": 0}

            for glyph in glyf_elem.findall(".//TTGlyph"):
                glyph_name = glyph.get("name")
                if glyph_name:
                    # Check if it's a composite glyph
                    if glyph.find(".//component") is not None:
                        glyph_types["composite"] += 1
                    elif glyph.find(".//contour") is not None:
                        glyph_types["simple"] += 1
                    else:
                        glyph_types["empty"] += 1

            return {
                "total_glyphs": sum(glyph_types.values()),
                "glyph_types": glyph_types,
            }

        except Exception as e:
            return {"error": str(e)}

    def _group_unicode_ranges(self, char_codes: Set[int]) -> List[Dict]:
        """Group Unicode characters into ranges"""
        if not char_codes:
            return []

        sorted_codes = sorted(char_codes)
        ranges = []
        start = sorted_codes[0]
        end = start

        for code in sorted_codes[1:]:
            if code == end + 1:
                end = code
            else:
                ranges.append(
                    {
                        "start": start,
                        "end": end,
                        "count": end - start + 1,
                        "start_hex": f"U+{start:04X}",
                        "end_hex": f"U+{end:04X}",
                    }
                )
                start = end = code

        # Add the last range
        ranges.append(
            {
                "start": start,
                "end": end,
                "count": end - start + 1,
                "start_hex": f"U+{start:04X}",
                "end_hex": f"U+{end:04X}",
            }
        )

        return ranges

    def compare_fonts(self, ttx_files: Dict[str, Dict[str, str]]) -> Dict:
        """Compare fonts and generate differences report"""
        comparison = {}

        # Get all font groups
        groups = list(ttx_files.keys())

        for i, group1 in enumerate(groups):
            for group2 in groups[i + 1 :]:
                comparison_key = f"{group1}_vs_{group2}"
                comparison[comparison_key] = {}

                # Compare emoji fonts
                emoji_fonts1 = {
                    k: v for k, v in ttx_files[group1].items() if "emoji" in k.lower()
                }
                emoji_fonts2 = {
                    k: v for k, v in ttx_files[group2].items() if "emoji" in k.lower()
                }

                if emoji_fonts1 and emoji_fonts2:
                    for font1_name, font1_path in emoji_fonts1.items():
                        for font2_name, font2_path in emoji_fonts2.items():
                            font_comparison = self._compare_two_fonts(
                                font1_path, font2_path
                            )
                            comparison[comparison_key][
                                f"{font1_name}_vs_{font2_name}"
                            ] = font_comparison

        return comparison

    def _compare_two_fonts(self, ttx1: str, ttx2: str) -> Dict:
        """Compare two specific fonts"""
        cmap1 = self.analyze_cmap_table(ttx1)
        cmap2 = self.analyze_cmap_table(ttx2)

        if "error" in cmap1 or "error" in cmap2:
            return {"error": "Failed to analyze one or both fonts"}

        chars1 = set(cmap1["char_mappings"].keys())
        chars2 = set(cmap2["char_mappings"].keys())

        common = chars1.intersection(chars2)
        only_in_1 = chars1 - chars2
        only_in_2 = chars2 - chars1

        return {
            "font1_total": len(chars1),
            "font2_total": len(chars2),
            "common": len(common),
            "only_in_font1": len(only_in_1),
            "only_in_font2": len(only_in_2),
            "common_chars": sorted(list(common)),
            "only_in_font1_chars": sorted(list(only_in_1)),
            "only_in_font2_chars": sorted(list(only_in_2)),
        }

    def generate_report(
        self, ttx_files: Dict[str, Dict[str, str]], comparison: Dict
    ) -> str:
        """Generate a comprehensive glyph analysis report"""
        report = []
        report.append("# Glyph Table Analysis Report\n")

        # Font summary
        report.append("## Font Summary\n")
        for group_name, fonts in ttx_files.items():
            report.append(f"### {group_name}\n")
            for font_name, ttx_path in fonts.items():
                report.append(f"- **{font_name}**: {ttx_path}\n")
            report.append("")

        # Individual font analysis
        report.append("## Individual Font Analysis\n")
        for group_name, fonts in ttx_files.items():
            report.append(f"### {group_name}\n")

            for font_name, ttx_path in fonts.items():
                report.append(f"#### {font_name}\n")

                # Analyze cmap table
                cmap_analysis = self.analyze_cmap_table(ttx_path)
                if "error" not in cmap_analysis:
                    report.append(
                        f"- **Character Mappings**: {cmap_analysis['total_mappings']:,}\n"
                    )
                    report.append(
                        f"- **Unicode Ranges**: {len(cmap_analysis['unicode_ranges'])}\n"
                    )

                    # Show top Unicode ranges
                    top_ranges = sorted(
                        cmap_analysis["unicode_ranges"],
                        key=lambda x: x["count"],
                        reverse=True,
                    )[:5]
                    report.append("- **Top Unicode Ranges**:\n")
                    for r in top_ranges:
                        report.append(
                            f"  - {r['start_hex']}-{r['end_hex']}: {r['count']:,} chars\n"
                        )
                else:
                    report.append(f"- **Error**: {cmap_analysis['error']}\n")

                # Analyze glyf table
                glyf_analysis = self.analyze_glyf_table(ttx_path)
                if "error" not in glyf_analysis:
                    report.append(
                        f"- **Total Glyphs**: {glyf_analysis['total_glyphs']:,}\n"
                    )
                    report.append(
                        f"- **Simple Glyphs**: {glyf_analysis['glyph_types']['simple']:,}\n"
                    )
                    report.append(
                        f"- **Composite Glyphs**: {glyf_analysis['glyph_types']['composite']:,}\n"
                    )
                    report.append(
                        f"- **Empty Glyphs**: {glyf_analysis['glyph_types']['empty']:,}\n"
                    )
                else:
                    report.append(f"- **Glyf Error**: {glyf_analysis['error']}\n")

                report.append("")

        # Comparison results
        report.append("## Font Comparisons\n")
        for comparison_key, comparisons in comparison.items():
            report.append(f"### {comparison_key}\n")

            for font_comparison_key, comparison_data in comparisons.items():
                if "error" in comparison_data:
                    report.append(f"#### {font_comparison_key}\n")
                    report.append(f"**Error**: {comparison_data['error']}\n\n")
                    continue

                report.append(f"#### {font_comparison_key}\n")
                report.append(
                    f"- **Font 1 Total**: {comparison_data['font1_total']:,}\n"
                )
                report.append(
                    f"- **Font 2 Total**: {comparison_data['font2_total']:,}\n"
                )
                report.append(f"- **Common**: {comparison_data['common']:,}\n")
                report.append(
                    f"- **Only in Font 1**: {comparison_data['only_in_font1']:,}\n"
                )
                report.append(
                    f"- **Only in Font 2**: {comparison_data['only_in_font2']:,}\n"
                )

                # Show some examples of differences
                if comparison_data["only_in_font1_chars"]:
                    examples = comparison_data["only_in_font1_chars"][:10]
                    report.append(
                        f"- **Examples only in Font 1**: {[f'U+{c:04X}' for c in examples]}\n"
                    )

                if comparison_data["only_in_font2_chars"]:
                    examples = comparison_data["only_in_font2_chars"][:10]
                    report.append(
                        f"- **Examples only in Font 2**: {[f'U+{c:04X}' for c in examples]}\n"
                    )

                report.append("")

        return "\n".join(report)

    def save_analysis(
        self,
        ttx_files: Dict,
        comparison: Dict,
        output_file: str = "glyph_analysis.json",
    ):
        """Save analysis results to JSON"""
        # Create serializable version
        analysis_data = {"ttx_files": ttx_files, "comparison": comparison}

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(analysis_data, f, indent=2, ensure_ascii=False)

        print(f"Analysis saved to {output_file}")


def main():
    parser = argparse.ArgumentParser(
        description="Analyze glyph tables using fontTools ttx"
    )
    parser.add_argument("--workspace", default=".", help="Workspace directory path")
    parser.add_argument(
        "--output", default="glyph_analysis.json", help="Output JSON file"
    )
    parser.add_argument(
        "--report", default="glyph_analysis_report.md", help="Output report file"
    )

    args = parser.parse_args()

    analyzer = GlyphAnalyzer(args.workspace)

    print("Discovering fonts...")
    font_groups = analyzer.discover_fonts()
    print(f"Found {len(font_groups)} font groups")

    print("\nExtracting fonts to TTX format...")
    ttx_files = analyzer.extract_all_fonts()

    print("\nComparing fonts...")
    comparison = analyzer.compare_fonts(ttx_files)

    print("\nGenerating report...")
    report = analyzer.generate_report(ttx_files, comparison)

    with open(args.report, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"Report saved to {args.report}")

    analyzer.save_analysis(ttx_files, comparison, args.output)

    print("\nGlyph analysis complete!")


if __name__ == "__main__":
    main()
