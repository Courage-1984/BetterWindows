#!/usr/bin/env python3
"""
Simple Glyph Analyzer using fontTools directly
Analyzes glyph tables without requiring ttx command
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Set
import argparse

try:
    from fontTools.ttLib import TTFont
except ImportError:
    print("fontTools not found. Install with: pip install fonttools")
    exit(1)

class SimpleGlyphAnalyzer:
    def __init__(self, workspace_path: str = "."):
        self.workspace_path = Path(workspace_path)
        self.results = {}
        
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
    
    def analyze_font_glyphs(self, font_path: str) -> Dict:
        """Analyze glyph information directly from font file"""
        try:
            font = TTFont(font_path)
            
            # Get basic font info
            name_table = font['name']
            font_name = "Unknown"
            font_version = "Unknown"
            
            for record in name_table.names:
                if record.nameID == 1:  # Font Family Name
                    font_name = record.toUnicode()
                elif record.nameID == 5:  # Version String
                    font_version = record.toUnicode()
            
            # Analyze cmap table
            cmap_table = font['cmap']
            char_mappings = {}
            
            for table in cmap_table.tables:
                if hasattr(table, 'cmap'):
                    for code, glyph_name in table.cmap.items():
                        char_mappings[code] = glyph_name
            
            # Analyze glyf table
            glyf_table = font['glyf']
            glyph_info = {
                "total_glyphs": len(glyf_table.glyphs),
                "simple_glyphs": 0,
                "composite_glyphs": 0,
                "empty_glyphs": 0
            }
            
            for glyph_name, glyph in glyf_table.glyphs.items():
                if hasattr(glyph, 'components'):
                    glyph_info["composite_glyphs"] += 1
                elif hasattr(glyph, 'endPtsOfContours'):
                    glyph_info["simple_glyphs"] += 1
                else:
                    glyph_info["empty_glyphs"] += 1
            
            # Analyze OS/2 table for additional metrics
            os2_table = font['OS/2']
            os2_info = {
                "xAvgCharWidth": getattr(os2_table, 'xAvgCharWidth', 0),
                "usWinAscent": getattr(os2_table, 'usWinAscent', 0),
                "usWinDescent": getattr(os2_table, 'usWinDescent', 0),
                "sCapHeight": getattr(os2_table, 'sCapHeight', 0),
                "sTypoAscender": getattr(os2_table, 'sTypoAscender', 0),
                "sTypoDescender": getattr(os2_table, 'sTypoDescender', 0),
                "sTypoLineGap": getattr(os2_table, 'sTypoLineGap', 0),
            }
            
            font.close()
            
            return {
                "name": font_name,
                "version": font_version,
                "file_path": font_path,
                "file_size": os.path.getsize(font_path),
                "char_mappings": len(char_mappings),
                "glyph_info": glyph_info,
                "os2_info": os2_info,
                "unicode_ranges": self._group_unicode_ranges(char_mappings.keys())
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
                ranges.append({
                    "start": start,
                    "end": end,
                    "count": end - start + 1,
                    "start_hex": f"U+{start:04X}",
                    "end_hex": f"U+{end:04X}"
                })
                start = end = code
        
        # Add the last range
        ranges.append({
            "start": start,
            "end": end,
            "count": end - start + 1,
            "start_hex": f"U+{start:04X}",
            "end_hex": f"U+{end:04X}"
        })
        
        return ranges
    
    def analyze_all_fonts(self):
        """Analyze all discovered fonts"""
        font_groups = self.discover_fonts()
        
        for group_name, font_files in font_groups.items():
            print(f"Analyzing {group_name}...")
            self.results[group_name] = {}
            
            for font_path in font_files:
                try:
                    font_info = self.analyze_font_glyphs(font_path)
                    font_name = Path(font_path).stem
                    self.results[group_name][font_name] = font_info
                    print(f"  + {font_name}: {font_info.get('name', 'Unknown')} v{font_info.get('version', 'Unknown')}")
                except Exception as e:
                    print(f"  - {Path(font_path).stem}: Error - {e}")
    
    def compare_fonts(self) -> Dict:
        """Compare fonts and generate differences report"""
        comparison = {}
        
        # Get all font groups
        groups = list(self.results.keys())
        
        for i, group1 in enumerate(groups):
            for group2 in groups[i+1:]:
                comparison_key = f"{group1}_vs_{group2}"
                comparison[comparison_key] = {}
                
                # Compare emoji fonts
                emoji_fonts1 = {k: v for k, v in self.results[group1].items() if "emoji" in k.lower()}
                emoji_fonts2 = {k: v for k, v in self.results[group2].items() if "emoji" in k.lower()}
                
                if emoji_fonts1 and emoji_fonts2:
                    for font1_name, font1_info in emoji_fonts1.items():
                        for font2_name, font2_info in emoji_fonts2.items():
                            if "error" not in font1_info and "error" not in font2_info:
                                font_comparison = self._compare_two_fonts(font1_info, font2_info)
                                comparison[comparison_key][f"{font1_name}_vs_{font2_name}"] = font_comparison
        
        return comparison
    
    def _compare_two_fonts(self, font1_info: Dict, font2_info: Dict) -> Dict:
        """Compare two specific fonts"""
        return {
            "font1": {
                "name": font1_info["name"],
                "version": font1_info["version"],
                "char_mappings": font1_info["char_mappings"],
                "total_glyphs": font1_info["glyph_info"]["total_glyphs"],
                "file_size": font1_info["file_size"]
            },
            "font2": {
                "name": font2_info["name"],
                "version": font2_info["version"],
                "char_mappings": font2_info["char_mappings"],
                "total_glyphs": font2_info["glyph_info"]["total_glyphs"],
                "file_size": font2_info["file_size"]
            },
            "differences": {
                "char_mappings_diff": font2_info["char_mappings"] - font1_info["char_mappings"],
                "glyphs_diff": font2_info["glyph_info"]["total_glyphs"] - font1_info["glyph_info"]["total_glyphs"],
                "file_size_diff": font2_info["file_size"] - font1_info["file_size"]
            }
        }
    
    def generate_report(self, comparison: Dict) -> str:
        """Generate a comprehensive glyph analysis report"""
        report = []
        report.append("# Simple Glyph Analysis Report\n")
        
        # Font summary
        report.append("## Font Summary\n")
        report.append("| Group | Font | Version | Char Mappings | Total Glyphs | Simple | Composite | Empty | Size (KB) |")
        report.append("|-------|------|---------|---------------|--------------|--------|-----------|-------|-----------|")
        
        for group_name, fonts in self.results.items():
            for font_name, font_info in fonts.items():
                if "error" not in font_info:
                    size_kb = font_info["file_size"] // 1024
                    report.append(f"| {group_name} | {font_info['name']} | {font_info['version']} | {font_info['char_mappings']:,} | {font_info['glyph_info']['total_glyphs']:,} | {font_info['glyph_info']['simple_glyphs']:,} | {font_info['glyph_info']['composite_glyphs']:,} | {font_info['glyph_info']['empty_glyphs']:,} | {size_kb:,} |")
        
        # Individual font analysis
        report.append("\n## Individual Font Analysis\n")
        for group_name, fonts in self.results.items():
            report.append(f"### {group_name}\n")
            
            for font_name, font_info in fonts.items():
                if "error" in font_info:
                    report.append(f"#### {font_name}\n")
                    report.append(f"**Error**: {font_info['error']}\n\n")
                    continue
                
                report.append(f"#### {font_name}\n")
                report.append(f"- **Name**: {font_info['name']}\n")
                report.append(f"- **Version**: {font_info['version']}\n")
                report.append(f"- **Character Mappings**: {font_info['char_mappings']:,}\n")
                report.append(f"- **Total Glyphs**: {font_info['glyph_info']['total_glyphs']:,}\n")
                report.append(f"- **Simple Glyphs**: {font_info['glyph_info']['simple_glyphs']:,}\n")
                report.append(f"- **Composite Glyphs**: {font_info['glyph_info']['composite_glyphs']:,}\n")
                report.append(f"- **Empty Glyphs**: {font_info['glyph_info']['empty_glyphs']:,}\n")
                report.append(f"- **File Size**: {font_info['file_size']:,} bytes\n")
                
                # Show top Unicode ranges
                if font_info['unicode_ranges']:
                    top_ranges = sorted(font_info['unicode_ranges'], 
                                      key=lambda x: x['count'], reverse=True)[:5]
                    report.append("- **Top Unicode Ranges**:\n")
                    for r in top_ranges:
                        report.append(f"  - {r['start_hex']}-{r['end_hex']}: {r['count']:,} chars\n")
                
                report.append("")
        
        # Comparison results
        report.append("## Font Comparisons\n")
        for comparison_key, comparisons in comparison.items():
            report.append(f"### {comparison_key}\n")
            
            for font_comparison_key, comparison_data in comparisons.items():
                report.append(f"#### {font_comparison_key}\n")
                report.append(f"- **Font 1**: {comparison_data['font1']['name']} v{comparison_data['font1']['version']}\n")
                report.append(f"- **Font 2**: {comparison_data['font2']['name']} v{comparison_data['font2']['version']}\n")
                report.append(f"- **Char Mappings Difference**: {comparison_data['differences']['char_mappings_diff']:,}\n")
                report.append(f"- **Glyphs Difference**: {comparison_data['differences']['glyphs_diff']:,}\n")
                report.append(f"- **File Size Difference**: {comparison_data['differences']['file_size_diff']:,} bytes\n")
                report.append("")
        
        return "\n".join(report)
    
    def save_results(self, comparison: Dict, output_file: str = "simple_glyph_analysis.json"):
        """Save analysis results to JSON"""
        analysis_data = {
            "fonts": self.results,
            "comparison": comparison
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(analysis_data, f, indent=2, ensure_ascii=False)
        
        print(f"Results saved to {output_file}")

def main():
    parser = argparse.ArgumentParser(description="Simple glyph analysis using fontTools")
    parser.add_argument("--workspace", default=".", help="Workspace directory path")
    parser.add_argument("--output", default="simple_glyph_analysis.json", help="Output JSON file")
    parser.add_argument("--report", default="simple_glyph_analysis_report.md", help="Output report file")
    
    args = parser.parse_args()
    
    analyzer = SimpleGlyphAnalyzer(args.workspace)
    
    print("Discovering fonts...")
    font_groups = analyzer.discover_fonts()
    print(f"Found {len(font_groups)} font groups")
    
    print("\nAnalyzing fonts...")
    analyzer.analyze_all_fonts()
    
    print("\nComparing fonts...")
    comparison = analyzer.compare_fonts()
    
    print("\nGenerating report...")
    report = analyzer.generate_report(comparison)
    
    with open(args.report, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"Report saved to {args.report}")
    
    analyzer.save_results(comparison, args.output)
    
    print("\nSimple glyph analysis complete!")

if __name__ == "__main__":
    main() 