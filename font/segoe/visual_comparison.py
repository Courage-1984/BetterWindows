#!/usr/bin/env python3
"""
Visual Font Comparison Tool
Renders emoji samples from different fonts for visual comparison
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Set
import argparse

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow not found. Install with: pip install Pillow")
    exit(1)

try:
    from fontTools.ttLib import TTFont
except ImportError:
    print("fontTools not found. Install with: pip install fonttools")
    exit(1)

class VisualComparator:
    def __init__(self, workspace_path: str = "."):
        self.workspace_path = Path(workspace_path)
        self.fonts = {}
        self.emoji_samples = []
        
    def load_font_analysis(self, analysis_file: str = "font_analysis.json"):
        """Load font analysis results"""
        if not os.path.exists(analysis_file):
            print(f"Analysis file {analysis_file} not found. Run font_analyzer.py first.")
            return False
            
        with open(analysis_file, 'r', encoding='utf-8') as f:
            self.fonts = json.load(f)
        return True
    
    def get_emoji_samples(self) -> List[int]:
        """Get a curated list of emoji Unicode points for comparison"""
        # Common emoji ranges for testing
        samples = []
        
        # Basic emoji (1F600-1F64F)
        for i in range(0x1F600, 0x1F650, 10):  # Every 10th emoji
            samples.append(i)
        
        # Transport symbols (1F680-1F6FF)
        for i in range(0x1F680, 0x1F700, 15):  # Every 15th transport emoji
            samples.append(i)
        
        # Objects (1F300-1F5FF)
        for i in range(0x1F300, 0x1F600, 20):  # Every 20th object emoji
            samples.append(i)
        
        # Supplemental symbols (1F900-1F9FF)
        for i in range(0x1F900, 0x1FA00, 25):  # Every 25th supplemental emoji
            samples.append(i)
        
        return samples
    
    def create_emoji_grid(self, font_path: str, emoji_codes: List[int], 
                         size: int = 64, cols: int = 10) -> Image.Image:
        """Create a grid of emoji samples from a font"""
        try:
            # Load font
            font = ImageFont.truetype(font_path, size=size)
            
            # Calculate grid dimensions
            rows = (len(emoji_codes) + cols - 1) // cols
            cell_size = size + 10  # Add padding
            
            # Create image
            img_width = cols * cell_size
            img_height = rows * cell_size
            img = Image.new('RGBA', (img_width, img_height), (255, 255, 255, 0))
            draw = ImageDraw.Draw(img)
            
            # Draw emoji grid
            for i, code in enumerate(emoji_codes):
                if i >= len(emoji_codes):
                    break
                    
                row = i // cols
                col = i % cols
                x = col * cell_size + 5
                y = row * cell_size + 5
                
                try:
                    # Convert Unicode code to character
                    char = chr(code)
                    draw.text((x, y), char, font=font, fill=(0, 0, 0, 255))
                except (ValueError, UnicodeEncodeError):
                    # Skip invalid Unicode
                    continue
            
            return img
            
        except Exception as e:
            print(f"Error creating grid for {font_path}: {e}")
            # Return empty image
            return Image.new('RGBA', (cols * (size + 10), 100), (255, 255, 255, 0))
    
    def create_comparison_image(self, output_file: str = "emoji_comparison.png"):
        """Create a side-by-side comparison of all fonts"""
        if not self.fonts:
            print("No font data loaded. Run load_font_analysis() first.")
            return
        
        # Get emoji samples
        emoji_samples = self.get_emoji_samples()
        print(f"Using {len(emoji_samples)} emoji samples for comparison")
        
        # Collect all emoji fonts
        emoji_fonts = []
        for group_name, fonts in self.fonts.items():
            for font_name, font_info in fonts.items():
                if "Emoji" in font_info['name']:
                    emoji_fonts.append({
                        'group': group_name,
                        'name': font_name,
                        'path': font_info['file_path'],
                        'version': font_info['version']
                    })
        
        if not emoji_fonts:
            print("No emoji fonts found!")
            return
        
        # Create individual grids
        grids = []
        for font_info in emoji_fonts:
            print(f"Creating grid for {font_info['group']}/{font_info['name']}...")
            grid = self.create_emoji_grid(font_info['path'], emoji_samples)
            grids.append((font_info, grid))
        
        # Combine grids into comparison image
        if not grids:
            print("No grids created!")
            return
        
        # Calculate layout
        grid_width = grids[0][1].width
        grid_height = grids[0][1].height
        padding = 20
        
        # Create combined image
        total_width = grid_width + padding * 2
        total_height = len(grids) * (grid_height + padding) + padding
        
        combined_img = Image.new('RGBA', (total_width, total_height), (255, 255, 255, 255))
        draw = ImageDraw.Draw(combined_img)
        
        # Try to load a system font for labels
        try:
            label_font = ImageFont.truetype("arial.ttf", 16)
        except:
            try:
                label_font = ImageFont.load_default()
            except:
                label_font = None
        
        # Place grids with labels
        y_offset = padding
        for font_info, grid in grids:
            # Add label
            if label_font:
                label = f"{font_info['group']}/{font_info['name']} (v{font_info['version']})"
                draw.text((padding, y_offset - 15), label, font=label_font, fill=(0, 0, 0, 255))
            
            # Place grid
            combined_img.paste(grid, (padding, y_offset), grid)
            y_offset += grid_height + padding
        
        # Save combined image
        combined_img.save(output_file, 'PNG')
        print(f"Comparison image saved to {output_file}")
    
    def create_difference_highlight(self, font1_path: str, font2_path: str, 
                                  output_file: str = "emoji_differences.png"):
        """Create a visual comparison highlighting differences between two fonts"""
        emoji_samples = self.get_emoji_samples()
        
        # Create grids for both fonts
        grid1 = self.create_emoji_grid(font1_path, emoji_samples)
        grid2 = self.create_emoji_grid(font2_path, emoji_samples)
        
        # Create difference image
        width = max(grid1.width, grid2.width)
        height = grid1.height + grid2.height + 50
        
        diff_img = Image.new('RGBA', (width, height), (255, 255, 255, 255))
        draw = ImageDraw.Draw(diff_img)
        
        # Try to load a system font for labels
        try:
            label_font = ImageFont.truetype("arial.ttf", 16)
        except:
            try:
                label_font = ImageFont.load_default()
            except:
                label_font = None
        
        # Add labels and grids
        if label_font:
            draw.text((10, 10), f"Font 1: {Path(font1_path).name}", font=label_font, fill=(0, 0, 0, 255))
            draw.text((10, grid1.height + 30), f"Font 2: {Path(font2_path).name}", font=label_font, fill=(0, 0, 0, 255))
        
        diff_img.paste(grid1, (0, 30))
        diff_img.paste(grid2, (0, grid1.height + 50))
        
        # Save difference image
        diff_img.save(output_file, 'PNG')
        print(f"Difference image saved to {output_file}")
    
    def create_unicode_coverage_visualization(self, output_file: str = "coverage_heatmap.png"):
        """Create a heatmap visualization of Unicode coverage"""
        if not self.fonts:
            print("No font data loaded.")
            return
        
        # Define Unicode ranges to visualize
        ranges = [
            ("Basic Emoji", 0x1F600, 0x1F64F),
            ("Transport", 0x1F680, 0x1F6FF),
            ("Objects", 0x1F300, 0x1F5FF),
            ("Supplemental", 0x1F900, 0x1F9FF),
        ]
        
        # Create heatmap
        cell_size = 4
        padding = 50
        legend_height = 100
        
        # Calculate dimensions
        max_range_size = max(end - start for _, start, end in ranges)
        heatmap_width = max_range_size * cell_size
        heatmap_height = len(ranges) * cell_size
        total_width = heatmap_width + padding * 2
        total_height = heatmap_height + padding * 2 + legend_height
        
        heatmap = Image.new('RGB', (total_width, total_height), (255, 255, 255))
        draw = ImageDraw.Draw(heatmap)
        
        # Try to load a system font for labels
        try:
            label_font = ImageFont.truetype("arial.ttf", 12)
        except:
            try:
                label_font = ImageFont.load_default()
            except:
                label_font = None
        
        # Draw heatmap
        y_offset = padding
        for range_name, start, end in ranges:
            # Draw range label
            if label_font:
                draw.text((10, y_offset), range_name, font=label_font, fill=(0, 0, 0, 255))
            
            # Draw coverage for each font
            x_offset = padding
            for group_name, fonts in self.fonts.items():
                for font_name, font_info in fonts.items():
                    if "Emoji" in font_info['name']:
                        # Get coverage for this range
                        supported_chars = set(font_info['supported_chars'])
                        range_chars = {c for c in supported_chars if start <= c <= end}
                        
                        # Calculate coverage percentage
                        total_in_range = end - start + 1
                        coverage = len(range_chars) / total_in_range if total_in_range > 0 else 0
                        
                        # Color based on coverage (green = high, red = low)
                        r = int(255 * (1 - coverage))
                        g = int(255 * coverage)
                        b = 0
                        
                        # Draw coverage bar
                        bar_width = total_in_range * cell_size
                        draw.rectangle([x_offset, y_offset, x_offset + bar_width, y_offset + cell_size], 
                                     fill=(r, g, b))
                        
                        # Add font label
                        if label_font:
                            label = f"{group_name}/{font_name}"
                            draw.text((x_offset, y_offset + cell_size + 2), label, 
                                    font=label_font, fill=(0, 0, 0, 255))
                        
                        x_offset += bar_width + 10
            
            y_offset += cell_size + 20
        
        # Save heatmap
        heatmap.save(output_file, 'PNG')
        print(f"Coverage heatmap saved to {output_file}")

def main():
    parser = argparse.ArgumentParser(description="Create visual comparisons of Segoe UI fonts")
    parser.add_argument("--analysis", default="font_analysis.json", help="Font analysis JSON file")
    parser.add_argument("--output", default="emoji_comparison.png", help="Output comparison image")
    parser.add_argument("--heatmap", default="coverage_heatmap.png", help="Output coverage heatmap")
    
    args = parser.parse_args()
    
    comparator = VisualComparator()
    
    if not comparator.load_font_analysis(args.analysis):
        return
    
    print("Creating emoji comparison...")
    comparator.create_comparison_image(args.output)
    
    print("Creating coverage heatmap...")
    comparator.create_unicode_coverage_visualization(args.heatmap)
    
    print("Visual comparison complete!")

if __name__ == "__main__":
    main() 