#!/usr/bin/env python3
"""
Segoe UI Font Analyzer and Comparator
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Set, Tuple
from dataclasses import dataclass, asdict

try:
    from fontTools.ttLib import TTFont
except ImportError:
    print("fontTools not found. Install with: pip install fonttools")
    exit(1)

@dataclass
class FontInfo:
    name: str
    version: str
    file_path: str
    file_size: int
    glyph_count: int
    supported_chars: Set[int]
    emoji_count: int

class FontAnalyzer:
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
    
    def analyze_font(self, font_path: str) -> FontInfo:
        """Analyze a single font file"""
        font = TTFont(font_path)
        
        # Get basic font info
        name_table = font['name']
        
        # Extract font name and version
        font_name = "Unknown"
        font_version = "Unknown"
        
        for record in name_table.names:
            if record.nameID == 1:  # Font Family Name
                font_name = record.toUnicode()
            elif record.nameID == 5:  # Version String
                font_version = record.toUnicode()
        
        # Get glyph count
        glyph_count = len(font.getGlyphOrder())
        
        # Analyze Unicode coverage
        cmap_table = font['cmap']
        supported_chars = set()
        
        for table in cmap_table.tables:
            if hasattr(table, 'cmap'):
                for code, glyph_name in table.cmap.items():
                    supported_chars.add(code)
        
        # Count emoji (Unicode ranges for emoji)
        emoji_count = sum(1 for char in supported_chars if (
            0x1F000 <= char <= 0x1FFFF or  # Miscellaneous Symbols and Pictographs
            0x1F600 <= char <= 0x1F64F or  # Emoticons
            0x1F650 <= char <= 0x1F67F or  # Ornamental Dingbats
            0x1F680 <= char <= 0x1F6FF or  # Transport and Map Symbols
            0x1F700 <= char <= 0x1F77F or  # Alchemical Symbols
            0x1F780 <= char <= 0x1F7FF or  # Geometric Shapes Extended
            0x1F800 <= char <= 0x1F8FF or  # Supplemental Arrows-C
            0x1F900 <= char <= 0x1F9FF or  # Supplemental Symbols and Pictographs
            0x1FA00 <= char <= 0x1FA6F or  # Chess Symbols
            0x1FA70 <= char <= 0x1FAFF or  # Symbols and Pictographs Extended-A
            0x1FB00 <= char <= 0x1FBFF     # Symbols for Legacy Computing
        ))
        
        font.close()
        
        return FontInfo(
            name=font_name,
            version=font_version,
            file_path=font_path,
            file_size=os.path.getsize(font_path),
            glyph_count=glyph_count,
            supported_chars=supported_chars,
            emoji_count=emoji_count
        )
    
    def analyze_all_fonts(self):
        """Analyze all discovered fonts"""
        font_groups = self.discover_fonts()
        
        for group_name, font_files in font_groups.items():
            print(f"Analyzing {group_name}...")
            self.results[group_name] = {}
            
            for font_path in font_files:
                try:
                    font_info = self.analyze_font(font_path)
                    font_name = Path(font_path).stem
                    self.results[group_name][font_name] = font_info
                    print(f"  + {font_name}: {font_info.name} v{font_info.version}")
                except Exception as e:
                    print(f"  - {Path(font_path).stem}: Error - {e}")
    
    def generate_report(self) -> str:
        """Generate a comparison report"""
        report = []
        report.append("# Segoe UI Font Comparison Report\n")
        
        # Summary table
        report.append("## Font Summary\n")
        report.append("| Group | Font | Version | Glyphs | Emoji | Size (KB) |")
        report.append("|-------|------|---------|--------|-------|-----------|")
        
        for group_name, fonts in self.results.items():
            for font_name, font_info in fonts.items():
                size_kb = font_info.file_size // 1024
                report.append(f"| {group_name} | {font_info.name} | {font_info.version} | {font_info.glyph_count:,} | {font_info.emoji_count:,} | {size_kb:,} |")
        
        # Unicode coverage comparison
        report.append("\n## Unicode Coverage Analysis\n")
        
        # Find all unique characters across all fonts
        all_chars = set()
        for fonts in self.results.values():
            for font_info in fonts.values():
                all_chars.update(font_info.supported_chars)
        
        # Create coverage matrix
        report.append("### Character Coverage Matrix\n")
        report.append("| Unicode Range | " + " | ".join([f"{group}" for group in self.results.keys()]) + " |")
        report.append("|---------------|" + "|".join(["---" for _ in self.results.keys()]) + "|")
        
        # Group characters by ranges
        ranges = {
            "Basic Latin (0x0020-0x007F)": (0x0020, 0x007F),
            "General Punctuation (0x2000-0x206F)": (0x2000, 0x206F),
            "Letterlike Symbols (0x2100-0x214F)": (0x2100, 0x214F),
            "Arrows (0x2190-0x21FF)": (0x2190, 0x21FF),
            "Mathematical Operators (0x2200-0x22FF)": (0x2200, 0x22FF),
            "Geometric Shapes (0x25A0-0x25FF)": (0x25A0, 0x25FF),
            "Miscellaneous Symbols (0x2600-0x26FF)": (0x2600, 0x26FF),
            "Dingbats (0x2700-0x27BF)": (0x2700, 0x27BF),
            "Emoji (0x1F000-0x1F6FF)": (0x1F000, 0x1F6FF),
            "Supplemental Symbols (0x1F900-0x1F9FF)": (0x1F900, 0x1F9FF),
        }
        
        for range_name, (start, end) in ranges.items():
            chars_in_range = {c for c in all_chars if start <= c <= end}
            if chars_in_range:
                row = [range_name]
                for group_name, fonts in self.results.items():
                    group_chars = set()
                    for font_info in fonts.values():
                        group_chars.update(font_info.supported_chars)
                    
                    coverage = len(chars_in_range.intersection(group_chars))
                    total = len(chars_in_range)
                    percentage = (coverage / total) * 100 if total > 0 else 0
                    row.append(f"{coverage}/{total} ({percentage:.1f}%)")
                
                report.append("| " + " | ".join(row) + " |")
        
        return "\n".join(report)
    
    def save_results(self, output_file: str = "font_analysis.json"):
        """Save analysis results to JSON file"""
        serializable_results = {}
        for group_name, fonts in self.results.items():
            serializable_results[group_name] = {}
            for font_name, font_info in fonts.items():
                font_dict = asdict(font_info)
                font_dict['supported_chars'] = list(font_info.supported_chars)
                serializable_results[group_name][font_name] = font_dict
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(serializable_results, f, indent=2, ensure_ascii=False)
        
        print(f"Results saved to {output_file}")

def main():
    analyzer = FontAnalyzer()
    
    print("Discovering fonts...")
    font_groups = analyzer.discover_fonts()
    print(f"Found {len(font_groups)} font groups:")
    for group, fonts in font_groups.items():
        print(f"  {group}: {len(fonts)} fonts")
    
    print("\nAnalyzing fonts...")
    analyzer.analyze_all_fonts()
    
    print("\nGenerating report...")
    report = analyzer.generate_report()
    
    with open("font_comparison_report.md", 'w', encoding='utf-8') as f:
        f.write(report)
    
    print("Report saved to font_comparison_report.md")
    analyzer.save_results()
    
    print("\nAnalysis complete!")

if __name__ == "__main__":
    main() 