"""
Reads and stores configurations for an access code.
"""

import copy
import random


class AccessCodeConfig:
    def __init__(self, row):
        # Default values
        self.domain = 'demo'
        self.example = 'na'
        self.prompt = 'na'
        self.engine = 'text-davinci-003'

        self.session_length = 0

        self.n = 5
        self.max_tokens = 50
        self.temperature = 0.95
        self.top_p = 1
        self.presence_penalty = 0.5
        self.frequency_penalty = 0.5
        self.stop = ['.']

        self.additional_data = None

        self.update(row)

    def convert_to_dict(self):
        return {
            'domain': self.domain,
            'example': self.example,
            'prompt': self.prompt,

            'session_length': self.session_length,

            'n': self.n,
            'max_tokens': self.max_tokens,
            'temperature': self.temperature,
            'top_p': self.top_p,
            'presence_penalty': self.presence_penalty,
            'frequency_penalty': self.frequency_penalty,
            'stop': self.stop,

            'engine': self.engine,

            'additional_data': self.additional_data,
        }

    def update(self, row):
        if 'domain' in row:
            self.domain = row['domain']
        if 'example' in row:
            self.example = row['example']
        if 'prompt' in row:
            self.prompt = row['prompt']

        if 'session_length' in row:
            self.session_length = int(row['session_length'])

        if 'n' in row:
            self.n = int(row['n'])
        if 'max_tokens' in row:
            self.max_tokens = int(row['max_tokens'])
        if 'temperature' in row:
            self.temperature = float(row['temperature'])
        if 'top_p' in row:
            self.top_p = float(row['top_p'])
        if 'presence_penalty' in row:
            self.presence_penalty = float(row['presence_penalty'])
        if 'frequency_penalty' in row:
            self.frequency_penalty = float(row['frequency_penalty'])
        if 'stop' in row:
            self.stop = [
                token.replace('\\n', '\n')
                for token in row['stop'].split('|')
            ]

        if 'additional_data' in row and row['additional_data'] != 'na':
            self.additional_data = row['additional_data']