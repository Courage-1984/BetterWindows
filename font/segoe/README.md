# Segoe UI Font Analysis Suite

A comprehensive toolkit for analyzing and comparing Segoe UI Emoji and Symbol fonts across different versions and sources.

## Overview

This suite provides both programmatic and visual analysis of Segoe UI fonts, including:

- **Unicode coverage analysis** - Which characters each font supports
- **Visual comparison** - Side-by-side emoji rendering across fonts
- **Glyph table analysis** - Detailed examination of font internals using fontTools
- **Coverage heatmaps** - Visual representation of Unicode block coverage
- **Difference detection** - Identify which emojis are added/removed between versions

## Font Collections Analyzed

The suite analyzes fonts from these collections:

- **segoe-ui-emoji** - Multiple versions (1.35, 1.40, 1.45) with flat and 3D variants
- **Segoemoji** - Windows 10 fonts (v1.29)
- **segoe_ui_unknown** - Unknown source (v1.51)
- **segoe_ui_Win11_InsiderPreview** - Windows 11 Insider Preview fonts (v1.51)

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Ensure you have the font files in their respective directories as shown in the project structure.

## Usage

### Quick Start

Run the complete analysis suite:

```bash
python run_analysis.py
```

This will:
1. Analyze all fonts and generate a comprehensive report
2. Create visual comparisons of emoji rendering
3. Generate Unicode coverage heatmaps
4. Extract and analyze glyph tables using fontTools

### Individual Tools

#### 1. Basic Font Analysis

```bash
python font_analyzer.py
```

Generates:
- `font_analysis.json` - Structured data about all fonts
- `font_comparison_report.md` - Human-readable comparison report

#### 2. Visual Comparison

```bash
python visual_comparison.py
```

Generates:
- `emoji_comparison.png` - Side-by-side emoji rendering
- `coverage_heatmap.png` - Unicode coverage visualization

#### 3. Glyph Table Analysis

```bash
python glyph_analyzer.py
```

Generates:
- `ttx_output/` - Extracted font tables in XML format
- `glyph_analysis.json` - Detailed glyph analysis data
- `glyph_analysis_report.md` - Glyph comparison report

### Advanced Usage

#### Skip Specific Analysis Steps

```bash
# Skip visual comparison (faster, no image generation)
python run_analysis.py --skip-visual

# Skip glyph analysis (faster, no TTX extraction)
python run_analysis.py --skip-glyph

# Skip both
python run_analysis.py --skip-visual --skip-glyph
```

#### Custom Workspace

```bash
python run_analysis.py --workspace /path/to/fonts
```

## Output Files

### Reports
- `font_comparison_report.md` - Comprehensive font comparison with Unicode coverage analysis
- `glyph_analysis_report.md` - Detailed glyph table analysis and comparisons

### Data Files
- `font_analysis.json` - Structured data for programmatic access
- `glyph_analysis.json` - Glyph table analysis data
- `ttx_output/` - Extracted font tables in XML format

### Visualizations
- `emoji_comparison.png` - Side-by-side emoji rendering comparison
- `coverage_heatmap.png` - Unicode block coverage heatmap

## Analysis Features

### Unicode Coverage Analysis

The suite analyzes Unicode coverage across multiple ranges:

- **Basic Latin** (0x0020-0x007F)
- **General Punctuation** (0x2000-0x206F)
- **Letterlike Symbols** (0x2100-0x214F)
- **Arrows** (0x2190-0x21FF)
- **Mathematical Operators** (0x2200-0x22FF)
- **Geometric Shapes** (0x25A0-0x25FF)
- **Miscellaneous Symbols** (0x2600-0x26FF)
- **Dingbats** (0x2700-0x27BF)
- **Emoji** (0x1F000-0x1F6FF)
- **Supplemental Symbols** (0x1F900-0x1F9FF)

### Visual Comparison

The visual comparison tool renders emoji samples from each font, allowing you to:

- See rendering differences between font versions
- Identify missing or different emoji designs
- Compare 3D vs flat emoji styles
- Spot font quality variations

### Glyph Table Analysis

Using fontTools' `ttx` command, the suite extracts and analyzes:

- **cmap tables** - Character to glyph mappings
- **name tables** - Font metadata and naming
- **glyf tables** - Glyph outline data
- **Unicode ranges** - Grouped character coverage

## Example Analysis Results

### Font Summary
| Group | Font | Version | Glyphs | Emoji | Size (KB) |
|-------|------|---------|--------|-------|-----------|
| segoe-ui-emoji | Segoe UI Emoji | 1.35 | 3,847 | 1,234 | 2,456 |
| Segoemoji | Segoe UI Emoji | 1.29 | 3,123 | 987 | 1,890 |
| segoe_ui_Win11_InsiderPreview | Segoe UI Emoji | 1.51 | 4,567 | 1,567 | 3,123 |

### Unicode Coverage Matrix
| Unicode Range | segoe-ui-emoji | Segoemoji | segoe_ui_Win11_InsiderPreview |
|---------------|----------------|-----------|-------------------------------|
| Basic Emoji (0x1F600-0x1F64F) | 80/80 (100.0%) | 80/80 (100.0%) | 80/80 (100.0%) |
| Transport (0x1F680-0x1F6FF) | 127/127 (100.0%) | 120/127 (94.5%) | 127/127 (100.0%) |

## Technical Details

### Dependencies
- **fontTools** - Font file parsing and analysis
- **Pillow (PIL)** - Image generation for visual comparisons

### Font File Support
- TrueType (.ttf) fonts
- OpenType (.otf) fonts (if supported by fontTools)

### Performance
- Basic analysis: ~30 seconds for all fonts
- Visual comparison: ~1-2 minutes (depends on font size)
- Glyph analysis: ~2-5 minutes (includes TTX extraction)

## Troubleshooting

### Common Issues

1. **fontTools not found**
   ```bash
   pip install fonttools
   ```

2. **Pillow not found**
   ```bash
   pip install Pillow
   ```

3. **ttx command not found**
   - Ensure fontTools is properly installed
   - Check that `ttx` is in your PATH

4. **Font loading errors**
   - Verify font files are valid TTF files
   - Check file permissions
   - Ensure fonts are not corrupted

### Debug Mode

For detailed error information, run individual scripts with verbose output:

```bash
python font_analyzer.py --verbose
```

## Contributing

To extend the analysis suite:

1. Add new Unicode ranges in `font_analyzer.py`
2. Extend visual comparison in `visual_comparison.py`
3. Add new glyph table analysis in `glyph_analyzer.py`

## License

This project is provided as-is for educational and research purposes.

## Acknowledgments

- **fontTools** - Comprehensive font analysis library
- **Pillow** - Python Imaging Library for image generation
- **Microsoft** - Segoe UI font family 