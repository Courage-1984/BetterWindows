#!/usr/bin/env python3
"""
Main Font Analysis Runner
Orchestrates all analysis tools for comprehensive Segoe UI font comparison
"""

import os
import sys
import subprocess
from pathlib import Path
import argparse

def check_dependencies():
    """Check if required dependencies are installed"""
    missing = []
    
    try:
        import fontTools
        print("✓ fontTools found")
    except ImportError:
        missing.append("fontTools")
        print("✗ fontTools not found")
    
    try:
        import PIL
        print("✓ Pillow found")
    except ImportError:
        missing.append("Pillow")
        print("✗ Pillow not found")
    
    if missing:
        print(f"\nMissing dependencies: {', '.join(missing)}")
        print("Install with: pip install -r requirements.txt")
        return False
    
    return True

def run_script(script_name: str, args: list = None):
    """Run a Python script and return success status"""
    cmd = [sys.executable, script_name]
    if args:
        cmd.extend(args)
    
    print(f"\n{'='*60}")
    print(f"Running {script_name}...")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running {script_name}: {e}")
        print("STDOUT:", e.stdout)
        print("STDERR:", e.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description="Comprehensive Segoe UI Font Analysis")
    parser.add_argument("--skip-visual", action="store_true", help="Skip visual comparison")
    parser.add_argument("--skip-glyph", action="store_true", help="Skip glyph analysis")
    parser.add_argument("--workspace", default=".", help="Workspace directory path")
    
    args = parser.parse_args()
    
    print("Segoe UI Font Analysis Suite")
    print("=" * 40)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check if we're in the right directory
    workspace_path = Path(args.workspace)
    if not workspace_path.exists():
        print(f"Workspace path {workspace_path} does not exist!")
        sys.exit(1)
    
    # Change to workspace directory
    os.chdir(workspace_path)
    
    # Step 1: Basic font analysis
    print("\nStep 1: Basic Font Analysis")
    if not run_script("font_analyzer.py"):
        print("Basic font analysis failed!")
        sys.exit(1)
    
    # Step 2: Visual comparison (optional)
    if not args.skip_visual:
        print("\nStep 2: Visual Comparison")
        if not run_script("visual_comparison.py"):
            print("Visual comparison failed!")
    
    # Step 3: Glyph analysis (optional)
    if not args.skip_glyph:
        print("\nStep 3: Glyph Analysis")
        if not run_script("glyph_analyzer.py"):
            print("Glyph analysis failed!")
    
    # Generate summary
    print("\n" + "="*60)
    print("ANALYSIS COMPLETE")
    print("="*60)
    
    # List generated files
    output_files = [
        "font_analysis.json",
        "font_comparison_report.md",
        "emoji_comparison.png",
        "coverage_heatmap.png",
        "glyph_analysis.json",
        "glyph_analysis_report.md"
    ]
    
    print("\nGenerated files:")
    for file in output_files:
        if os.path.exists(file):
            size = os.path.getsize(file)
            print(f"✓ {file} ({size:,} bytes)")
        else:
            print(f"✗ {file} (not found)")
    
    # List TTX output directory
    ttx_dir = Path("ttx_output")
    if ttx_dir.exists():
        ttx_files = list(ttx_dir.glob("*.ttx"))
        print(f"\nTTX files generated: {len(ttx_files)}")
        for ttx_file in ttx_files:
            size = ttx_file.stat().st_size
            print(f"  - {ttx_file.name} ({size:,} bytes)")
    
    print("\nNext steps:")
    print("1. Review font_comparison_report.md for detailed analysis")
    print("2. View emoji_comparison.png for visual comparison")
    print("3. Check coverage_heatmap.png for Unicode coverage visualization")
    print("4. Examine glyph_analysis_report.md for detailed glyph analysis")
    print("5. Use font_analysis.json for programmatic access to results")

if __name__ == "__main__":
    main() 