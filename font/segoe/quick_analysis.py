#!/usr/bin/env python3
"""
Quick Segoe UI Font Analysis
Runs the essential analysis tools for fast results
"""

import subprocess
import sys
import os
from pathlib import Path

def run_quick_analysis():
    """Run the essential analysis tools"""
    print("Quick Segoe UI Font Analysis")
    print("=" * 40)
    
    # Check dependencies
    try:
        import fontTools
        import PIL
        print("✓ Dependencies found")
    except ImportError as e:
        print(f"✗ Missing dependency: {e}")
        print("Install with: pip install -r requirements.txt")
        return False
    
    # Step 1: Basic font analysis
    print("\n1. Running basic font analysis...")
    try:
        result = subprocess.run([sys.executable, "font_analyzer.py"], 
                              capture_output=True, text=True, check=True)
        print("✓ Basic analysis complete")
    except subprocess.CalledProcessError as e:
        print(f"✗ Basic analysis failed: {e}")
        return False
    
    # Step 2: Visual comparison
    print("\n2. Creating visual comparison...")
    try:
        result = subprocess.run([sys.executable, "visual_comparison.py"], 
                              capture_output=True, text=True, check=True)
        print("✓ Visual comparison complete")
    except subprocess.CalledProcessError as e:
        print(f"✗ Visual comparison failed: {e}")
    
    # Step 3: Simple glyph analysis
    print("\n3. Running glyph analysis...")
    try:
        result = subprocess.run([sys.executable, "simple_glyph_analyzer.py"], 
                              capture_output=True, text=True, check=True)
        print("✓ Glyph analysis complete")
    except subprocess.CalledProcessError as e:
        print(f"✗ Glyph analysis failed: {e}")
    
    # Show results
    print("\n" + "="*40)
    print("ANALYSIS COMPLETE")
    print("="*40)
    
    output_files = [
        ("font_analysis.json", "Basic font data"),
        ("font_comparison_report.md", "Font comparison report"),
        ("emoji_comparison.png", "Visual emoji comparison"),
        ("coverage_heatmap.png", "Unicode coverage heatmap"),
        ("simple_glyph_analysis.json", "Glyph analysis data"),
        ("simple_glyph_analysis_report.md", "Glyph analysis report"),
        ("ANALYSIS_SUMMARY.md", "Complete analysis summary")
    ]
    
    print("\nGenerated files:")
    for filename, description in output_files:
        if os.path.exists(filename):
            size = os.path.getsize(filename)
            print(f"✓ {filename} ({size:,} bytes) - {description}")
        else:
            print(f"✗ {filename} - {description}")
    
    print("\nKey findings:")
    print("- Check font_comparison_report.md for Unicode coverage analysis")
    print("- View emoji_comparison.png for visual differences")
    print("- Read ANALYSIS_SUMMARY.md for complete findings")
    
    return True

if __name__ == "__main__":
    success = run_quick_analysis()
    sys.exit(0 if success else 1) 