#!/usr/bin/env python3
"""
Audiowaveform Peak Generator Script

This script processes audio files in a specific directory structure:
data/data/<num>/compressed/*.mp3 and *.wav

For each audio file, it generates a corresponding JSON peak file using audiowaveform
and saves it to data/data/<num>/peaks/*.json
"""

import os
import subprocess
import sys
import json
from pathlib import Path
import logging

# Set up logging (console only)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class AudiowaveformProcessor:
    """Class to handle audiowaveform processing and normalization"""

    def deinterleave(self, data, channelCount):
        """Deinterleaves the peak data from audiowaveform."""
        deinterleaved = [data[idx::channelCount * 2] for idx in range(channelCount * 2)]
        new_data = []

        for ch in range(channelCount):
            idx1 = 2 * ch
            idx2 = 2 * ch + 1
            ch_data = [None] * (len(deinterleaved[idx1]) + len(deinterleaved[idx2]))
            ch_data[::2] = deinterleaved[idx1]
            ch_data[1::2] = deinterleaved[idx2]
            new_data.append(ch_data)
        return new_data

    def scale_json(self, filename):
        """Normalizes the peak data in the JSON file to a range of 0-1."""
        try:
            with open(filename, "r") as f:
                file_content = f.read()

            json_content = json.loads(file_content)
            data = json_content["data"]
            channels = json_content.get("channels", 1)
            digits = 2  # Number of decimals to use when rounding

            max_val = float(max(data))
            if max_val == 0:  # Avoid division by zero for silent audio
                logger.warning(f"Silent audio detected in {filename}, skipping normalization")
                return True

            new_data = [round(x / max_val, digits) for x in data]

            # Deinterleave the peak data if using the --split-channels flag
            if channels > 1:
                json_content["data"] = self.deinterleave(new_data, channels)
            else:
                json_content["data"] = new_data

            file_content = json.dumps(json_content, separators=(',', ':'))

            with open(filename, "w") as f:
                f.write(file_content)

            logger.info(f"Successfully normalized peaks: {filename}")
            return True

        except Exception as e:
            logger.error(f"Failed to normalize {filename}: {str(e)}")
            return False

    def generate_waveform_peaks(self, input_file, output_file):
        """
        Generate waveform peaks using audiowaveform command and normalize the output

        Args:
            input_file (str): Path to input audio file (MP3 or WAV)
            output_file (str): Path to output JSON file

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Generate waveform peaks
            subprocess.run([
                "audiowaveform",
                "-i", str(input_file),
                "-o", str(output_file),
                "--pixels-per-second", "20",
                "--bits", "8"
            ], check=True, capture_output=True, text=True)

            logger.info(f"Successfully generated peaks: {input_file} -> {output_file}")

            # Normalize the generated JSON file
            if self.scale_json(output_file):
                logger.info(f"Peak generation and normalization completed: {input_file}")
                return True
            else:
                logger.error(f"Peak generation succeeded but normalization failed: {input_file}")
                return False

        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to generate peaks for {input_file}")
            logger.error(f"Error: {e.stderr}")
            return False
        except FileNotFoundError:
            logger.error("audiowaveform command not found. Make sure it's installed and in PATH.")
            return False
        except Exception as e:
            logger.error(f"Unexpected error processing {input_file}: {str(e)}")
            return False


def generate_waveform_peaks(input_file, output_file):
    """
    Legacy function for backward compatibility - now uses the class method
    """
    processor = AudiowaveformProcessor()
    return processor.generate_waveform_peaks(input_file, output_file)


def process_directory(base_path="data/data"):
    """
    Process all numbered directories and generate peaks for MP3 files

    Args:
        base_path (str): Base path to the data directory (default: "data/data")
    """
    base_dir = Path(base_path)

    if not base_dir.exists():
        logger.error(f"Base directory {base_path} does not exist")
        return

    # Statistics
    total_processed = 0
    total_successful = 0
    total_failed = 0

    # Find all numbered directories
    numbered_dirs = []
    for item in base_dir.iterdir():
        if item.is_dir() and item.name.isdigit():
            numbered_dirs.append(item)

    if not numbered_dirs:
        logger.warning(f"No numbered directories found in {base_path}")
        return

    # Sort directories numerically
    numbered_dirs.sort(key=lambda x: int(x.name))

    logger.info(f"Found {len(numbered_dirs)} numbered directories to process")

    for num_dir in numbered_dirs:
        logger.info(f"Processing directory: {num_dir.name}")

        # Check for compressed folder
        compressed_dir = num_dir / "compressed"
        if not compressed_dir.exists():
            logger.warning(f"Compressed folder not found in {num_dir.name}, skipping")
            continue

        # Create peaks folder
        peaks_dir = num_dir / "peaks"
        peaks_dir.mkdir(exist_ok=True)
        logger.info(f"Created/verified peaks directory: {peaks_dir}")

        # Find all audio files (MP3 and WAV) in compressed folder
        audio_files = []
        audio_files.extend(compressed_dir.glob("*.mp3"))
        audio_files.extend(compressed_dir.glob("*.wav"))

        if not audio_files:
            logger.warning(f"No audio files (MP3/WAV) found in {compressed_dir}")
            continue

        # Sort audio files by name (numeric sorting)
        audio_files.sort(key=lambda x: int(x.stem) if x.stem.isdigit() else float('inf'))

        logger.info(f"Found {len(audio_files)} audio files in {num_dir.name}/compressed")

        # Process each audio file
        for audio_file in audio_files:
            # Generate output filename (same name but .json extension)
            json_filename = audio_file.stem + ".json"
            output_file = peaks_dir / json_filename

            # Skip if output file already exists (optional - remove this check if you want to overwrite)
            if output_file.exists():
                logger.info(f"Output file {output_file} already exists, skipping")
                continue

            logger.info(f"Processing: {audio_file.name} -> {json_filename}")

            # Generate waveform peaks
            success = generate_waveform_peaks(audio_file, output_file)

            total_processed += 1
            if success:
                total_successful += 1
            else:
                total_failed += 1

    logger.info("=" * 50)
    logger.info("PROCESSING SUMMARY")
    logger.info("=" * 50)
    logger.info(f"Total files processed: {total_processed}")
    logger.info(f"Successful (generated + normalized): {total_successful}")
    logger.info(f"Failed: {total_failed}")
    logger.info("=" * 50)


def main():
    """Main function"""
    logger.info("Starting Audiowaveform Peak Generator")

    # You can change the base path here if needed
    base_path = "data/data"

    # Check if audiowaveform is available
    try:
        result = subprocess.run(["audiowaveform", "--version"],
                              capture_output=True, text=True, check=True)
        logger.info(f"Audiowaveform version: {result.stdout.strip()}")
    except (subprocess.CalledProcessError, FileNotFoundError):
        logger.error("audiowaveform is not installed or not in PATH")
        logger.error("Please install audiowaveform before running this script")
        sys.exit(1)

    # Process directories
    process_directory(base_path)

    logger.info("Peak generation completed")


if __name__ == "__main__":
    main()