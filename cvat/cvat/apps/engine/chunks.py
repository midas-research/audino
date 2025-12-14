import os
import traceback
import subprocess


def get_video_duration(video_file):
    result = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', video_file],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    duration = float(result.stdout)
    return duration


class MakeVideoChunks:
    def make(task_id, chunk_duration=1):
        try:
            current_file_path = os.path.abspath(__file__)
            print(f"Current file path: {current_file_path}")

            # Define the raw video directory
            raw_video_dir = f"/home/vignesh/Desktop/Desktop/IIITD/BTP.02/cvat/data/data/{task_id}/raw"
            print(f"Raw video directory: {raw_video_dir}")

            # Recursively search for .mp4 files in the raw video directory and its subdirectories
            input_files = []
            for root, dirs, files in os.walk(raw_video_dir):
                for file in files:
                    if file.endswith('.mp4'):
                        input_files.append(os.path.join(root, file))

            # Check if any .mp4 files are found
            if not input_files:
                raise FileNotFoundError("No .mp4 files found in the specified directory or subdirectories.")

            print(f"Input files: {input_files}")
            input_file = input_files[0]  # Use the first .mp4 file found
            output_folder = f"/home/vignesh/Desktop/Desktop/IIITD/BTP.02/cvat/data/data/{task_id}/compressed"

            # Create the output folder if it doesn't exist
            os.makedirs(output_folder, exist_ok=True)

            print(f"Processing video: {input_file}")

            # Retrieve video duration
            video_duration = get_video_duration(input_file)
            print(f"Video duration: {video_duration} seconds")

            # Define start and end times
            start_time = 0  # Start from the beginning of the video
            end_time = int(video_duration)  # Set end time to the duration of the video

            # Create chunks using a loop
            for i in range(start_time, end_time, chunk_duration):
                output_file = os.path.join(output_folder, f'{i}.mp4')

                # If the output file exists, remove it
                if os.path.exists(output_file):
                    print(f"File {output_file} already exists. Removing it.")
                    os.remove(output_file)

                command = [
                    'ffmpeg',
                    '-ss', str(i),                          # Start time for the chunk
                    '-i', input_file,                       # Input file
                    '-c', 'copy',                           # Copy codec, no re-encoding
                    '-t', str(chunk_duration),              # Duration of the chunk
                    output_file                             # Output file path
                ]

                # Execute the command
                print(' '.join(command))
                subprocess.run(command)

            response = {
                "success": True,
                "message": None,
                "data": None,
                "error": None
            }

            return response
        except Exception as e:
            print(str(e))
            error = traceback.print_exc()

            response = {
                "success": False,
                "message": f"An unexpected error occurred, Error: {e}",
                "data": None,
                "error": error
            }

            return response