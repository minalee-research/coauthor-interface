"""
Parse user prompts and responses from the OpenAI API.
"""

from nltk.tokenize import sent_tokenize, word_tokenize
import numpy as np


def parse_prompt(text, max_tokens, context_window_size):
    """Separate prompt and whitespace at the end while retaining newlines."""

    # Check the number of tokens in a prompt
    max_prompt_len = (context_window_size - max_tokens) * 4

    before_prompt = ''
    prompt = text
    if len(text) > max_prompt_len:
        before_prompt = text[:-max_prompt_len]
        prompt = text[-max_prompt_len:]

    lines = prompt.split('\n')
    removed = lines[-1].rstrip()

    effective_prompt = '\n'.join(lines[:-1] + [removed])
    after_prompt = lines[-1][len(removed):]  # Contains removed whitespace at the end

    results = {
        'text_len': len(text),
        'before_prompt': before_prompt,
        'effective_prompt': effective_prompt,
        'after_prompt': after_prompt,
    }
    return results


def parse_probability(
    logprobs
):
    """
    Parameters:
        logprobs (dict): Log probabilities from the OpenAI API.

        {
            "text_offset": [
            29,
            30
            ],
            "token_logprobs": [
            -0.5101724,
            -0.0023583714
            ],
            "tokens": [
            "\n",
            "\n"
            ],
            "top_logprobs": [
            {
                "\n": -0.5101724,
                "\n\n": -2.4846368,
                " \"": -4.7935433,
                " A": -5.296382,
                " And": -5.566975,
                " He": -3.6563518,
                " I": -3.6161406,
                " It": -4.898417,
                " She": -4.024756,
                " The": -3.6964784
            },
            {
                "\n": -0.0023583714,
                "\"": -7.769572,
                "<|endoftext|>": -9.8403225,
                "A": -10.508828,
                "He": -10.540295,
                "I": -10.106401,
                "In": -9.831608,
                "It": -10.524727,
                "The": -8.769527,
                "This": -10.438849
            }
            ]
        },
        "text": "\n\n"
        }
    """
    logprob = sum(logprobs['token_logprobs'])
    prob = np.e ** logprob
    return prob * 100


def parse_suggestion(
    suggestion,
    after_prompt,
    stop_rules
):
    processed_suggestion = suggestion

    # Remove (duplicate) whitespace
    if suggestion.startswith(after_prompt):
        processed_suggestion = suggestion[len(after_prompt):]

    # Return the first sentence and discard the rest
    if '.' in stop_rules:
        sentences = sent_tokenize(processed_suggestion)
        if not sentences:
            return ''

        first_sentence = sentences[0].strip().split('\n')[0]

        # Retain the preceeding whitespace
        start = processed_suggestion.index(first_sentence)
        end = start + len(first_sentence)
        processed_suggestion = processed_suggestion[:end]
    return processed_suggestion


def filter_suggestions(
    suggestions,
    prev_suggestions,
    blocklist,
    remove_empty_strings=True,
    remove_duplicates=True,
    use_blocklist=True,
):
    """
    Parameters:
        suggestions: a list of (suggestion, probability)
        blocklist: a set of strings
    """
    filtered_suggestions = []
    duplicates = set([prev_sugg['original'] for prev_sugg in prev_suggestions])

    empty_cnt = 0
    duplicate_cnt = 0
    bad_cnt = 0

    for (suggestion, probability, source) in suggestions:
        # Filter out empty strings
        if remove_empty_strings:
            if not suggestion:  # Make sure it's not due to \n in stop_sequence
                empty_cnt += 1
                continue

        # Filter out duplicates
        if remove_duplicates:
            if suggestion in duplicates:
                duplicate_cnt += 1
                continue

        # Filter out potentially offensive language
        if use_blocklist:
            words = word_tokenize(suggestion.lower())
            if any([word in words for word in blocklist]):
                bad_cnt += 1
                print(f'bad_cnt: {suggestion}')
                continue

        duplicates.add(suggestion)
        filtered_suggestions.append((suggestion, probability, source))

    counts = {
        'empty_cnt': empty_cnt,
        'duplicate_cnt': duplicate_cnt,
        'bad_cnt': bad_cnt,
    }
    return filtered_suggestions, counts
