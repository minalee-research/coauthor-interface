import os
import csv
import json
import collections

from access_code import AccessCodeConfig


def read_api_keys(config_dir):
    """Read API keys from a CSV file."""
    path = os.path.join(config_dir, 'api_keys.csv')

    api_keys = dict()
    if not os.path.exists(path):
        raise RuntimeError(f'Cannot find API keys in the file: {path}')
    
    with open(path) as f:
        rows = csv.DictReader(f)
        for row in rows:
            host = row['host']  # 'openai', 'ai21labs', 'anthropic', 'eleutherai', etc.
            domain = row['domain']  # 'default', 'story', 'essay', etc.
            
            api_keys[(host, domain)] = row['key']
    return api_keys


def read_log(log_path):
    """Read a log file."""
    log = []
    if log_path.endswith('.json'):
        with open(log_path, 'r') as f:
            log = json.load(f)
    elif log_path.endswith('.jsonl'):
        with open(log_path, 'r') as f:
            for line in f:
                log.append(json.loads(line))
    else:
        print('# Unknown file extension:', log_path)
    return log


def read_examples(config_dir):
    """Read all examples from config_dir."""
    path = os.path.join(config_dir, 'examples')
    examples = {'na': ''}

    if not os.path.exists(path):
        print(f'# Path does not exist: {path}')
        return examples

    paths = []
    for filename in os.listdir(path):
        if filename.endswith('txt'):
            paths.append(os.path.join(path, filename))

    for path in paths:
        name = os.path.basename(path)[:-4]
        with open(path, 'r') as f:
            text = f.read().replace('\\n', '\n')
            text = text + ' '
        examples[name] = text
    return examples


def read_prompts(config_dir):
    """Read all prompts from config_dir."""
    path = os.path.join(config_dir, 'prompts.tsv')

    prompts = {'na': ''}
    with open(path) as f:
        rows = csv.reader(f, delimiter="\t", quotechar='"')
        for row in rows:
            if len(row) != 3:
                continue

            prompt_code = row[1]
            prompt = row[2].replace('\\n', '\n')
            prompts[prompt_code] = prompt
    return prompts


def read_access_codes(config_dir):
    """Read all access codes from config_dir.

    Return a dictionary with access codes as keys and configs as values.
    """
    access_codes = dict()

    # Retrieve all file names that contain 'access_code'
    if not os.path.exists(config_dir):
        raise RuntimeError(f'Cannot find access code at {config_dir}')

    paths = []
    for filename in os.listdir(config_dir):
        if 'access_code' in filename and filename.endswith('csv'):
            paths.append(os.path.join(config_dir, filename))

    # Read access codes with configs
    for path in paths:
        with open(path, 'r') as f:
            input_file = csv.DictReader(f)

            for row in input_file:
                if 'access_code' not in row:
                    print(f'# Could not find access_code in {path}:\n{row}')
                    continue

                access_code = row['access_code']
                config = AccessCodeConfig(row)
                access_codes[access_code] = config
    return access_codes


def update_metadata(metadata, metadata_path):
    """Update metadata with the most recent history."""
    with open(metadata_path, 'r') as f:
        lines = f.read().split('\n')
        for line in lines:
            if not line:  # Skip empty line at the end
                continue
            history = json.loads(line)
            session_id = history['session_id']

            # Overwrite with the most recent history
            metadata[session_id] = history
    return metadata


def read_blocklist(config_dir):
    """Read blocklist from a text file."""
    path = os.path.join(config_dir, 'blocklist.txt')

    blocklist = set()
    with open(path, 'r') as f:
        lines = f.read().split('\n')
        for line in lines:
            if not line:  # Skip empty line at the end
                continue
            blocklist.add(line.strip())
    return blocklist
