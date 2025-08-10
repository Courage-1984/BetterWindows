#!/usr/bin/env python3
"""
Debug script to examine font Unicode coverage
"""

from fontTools.ttLib import TTFont
from pathlib import Path

def debug_font(font_path):
    """Debug a single font to see what Unicode characters it contains"""
    print(f"\n=== Debugging {font_path} ===")
    
    try:
        font = TTFont(font_path)
        
        # Get cmap table
        cmap_table = font['cmap']
        
        # Collect all Unicode characters
        all_chars = set()
        
        for table in cmap_table.tables:
            print(f"  Cmap table format: {table.format}")
            print(f"  Platform ID: {table.platformID}")
            print(f"  Platform Encoding ID: {table.platEncID}")
            
            # Only try to access langID for format 4 tables
            if table.format == 4:
                try:
                    print(f"  Language ID: {table.langID}")
                except:
                    print(f"  Language ID: N/A")
            
            if hasattr(table, 'cmap'):
                for code, glyph_name in table.cmap.items():
                    all_chars.add(code)
                    if 0x1F000 <= code <= 0x1FFFF:
                        print(f"    EMOJI: U+{code:04X} -> {glyph_name}")
        
        print(f"\n  Total characters: {len(all_chars)}")
        
        # Check for emoji ranges
        emoji_ranges = [
            (0x1F000, 0x1FFFF, "Miscellaneous Symbols and Pictographs"),
            (0x1F600, 0x1F64F, "Emoticons"),
            (0x1F680, 0x1F6FF, "Transport and Map Symbols"),
            (0x1F900, 0x1F9FF, "Supplemental Symbols and Pictographs"),
        ]
        
        for start, end, name in emoji_ranges:
            count = sum(1 for char in all_chars if start <= char <= end)
            if count > 0:
                print(f"  {name}: {count} characters")
                # Show some examples
                examples = [char for char in all_chars if start <= char <= end][:5]
                for char in examples:
                    print(f"    U+{char:04X}")
        
        # Show some high Unicode characters
        high_chars = [char for char in all_chars if char > 0xFFFF]
        if high_chars:
            print(f"\n  High Unicode characters (>0xFFFF): {len(high_chars)}")
            for char in sorted(high_chars)[:10]:
                print(f"    U+{char:04X}")
        
        font.close()
        
    except Exception as e:
        print(f"  Error: {e}")

def main():
    # Test a few fonts
    test_fonts = [
        "segoe-ui-emoji/seguiemj-1.45-3d.ttf",
        "Segoemoji/SEGUIEMJ.TTF",
        "segoe_ui_Win11_InsiderPreview/seguiemj.ttf"
    ]
    
    for font_path in test_fonts:
        if Path(font_path).exists():
            debug_font(font_path)
        else:
            print(f"Font not found: {font_path}")

if __name__ == "__main__":
    main() 