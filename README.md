<div align="center">

<img src="./coauthor.png" width="350px"/>

**An Open-Source Interface for Human-Language Model (LM) Interaction**

</div>

## Overview

This repository contains the code for the **interface** of [CoAuthor](https://coauthor.stanford.edu). The interface comes in two parts: (1) the frontend presented to the users for writing and to view replays, and (2) the backend that serves requests from the frontend and queries models to generate suggestions.

For downloading the CoAuthor dataset and replaying its writing sessions, please visit the [website](https://coauthor.stanford.edu) instead.

- Paper: 
[CoAuthor: Designing a Human-AI Collaborative Writing Dataset for Exploring Language Model Capabilities](https://arxiv.org/abs/2201.06796) ([Mina Lee](https://minalee.info/), [Percy Liang](https://cs.stanford.edu/~pliang/), and [Qian Yang](https://qianyang.co/), CHI 2022)
- Main contributors of this repository: [Mina Lee](https://minalee.info/) and [Vishakh Padmakumar](https://vishakhpk.github.io/).

If you have any questions, please feel free to reach out to [Mina Lee](https://minalee.info/) at `minalee@stanford.edu`.

---

## Contents
- [Overview](#overview)
- [Contents](#contents)
- [Backend](#backend)
- [Frontend](#frontend)
- [Advanced Usage](#advanced-usage)
- [Metrics](#metrics)

---

## Backend 

The backend is a Flask app that serves requests from users, manages sessions, and stores logs for future replays.

By default, the backend is setup to support [OpenAI models](https://platform.openai.com/docs/models) via OpenAI API. To use other models, you will need to modify the backend to support them.

**1. Clone this Github repository**

Type the following command to clone this repository into a directory of your choice:

```
git clone https://github.com/minggg/coauthor-interface
```

Inside of the `coauthor-interface` directory run the following to install required packages:

```
pip install -r requirements.txt
```

**2. Add your API key(s) to use OpenAI models**

Create a file `./config/api_keys.csv` and add your API key(s) as follows:

| host | domain | key |
| ---- | ------ | --- |
| openai | default | sk-*************************************** |

Replace the `sk-***************************************` with your OpenAI API key. If you don't have it, you can get one [here](https://openai.com/pricing).

For `host` and `domain`, you can simply use `openai` and `default`. If you want to define a new domain for your experiments and use a specific key for a subset of access codes that are under the domain, see [Advanced Usage](#Advanced-Usage) for more details on setting up new domains.

**3. Run the server on your local machine or on a server**

Run the server in `./backend` with basic parameters as follows:
```
python3 api_server.py \
    --config_dir '../config' \
    --log_dir ../logs \
    --port 5555 \
    --proj_name 'pilot' \
    --debug
```

The backend initializes sessions using access codes that are read from `data/access\_codes.csv`. When you enter the frontend, the access code provided needs to match one of the created codes here.  

The choice of models, examples (prompts that are hidden from users), and prompts (prompts that are shown to users in the text editor) can be specified when you create `data/access\_codes.csv`. 

---

## Frontend

**1. Run the frontend**

You can run the frontend using a simple Python server or host it on a third-party server.

To run the frontend on a local machine, run the following command in the `./frontend` directory:

```
python -m http.server 8000
```

To run the frontend on a server, you can use a third-party platform such as [Glitch](https://glitch.com/).

**2. Set the server URL**

Update `./frontend/js/config.js` to have the correct URL of the frontend and backend server. For instance, if your server is running on `http://127.0.0.1:5555` and your frontend is running on `http://127.0.0.1:8000` then the following two lines in the config file should look like:

```
const serverURL = 'http://127.0.0.1:5555'
const frontendURL = 'http://127.0.0.1:8000' 
```

**3. Access the frontend**

Now, you can access the frontend server on your browser as follows:

```
FRONTEND_URL/index.html?access_code=ACCESS_CODE
```

where `FRONTEND_URL` is the URL of the frontend server (e.g. `http://127.0.0.1:8000`) and `ACCESS_CODE` is one of the access codes you defined in `./config/access_codes.csv`. If you have followed the instructions above, you should be able to access the frontend at [here](http://127.0.0.1:8000/index.html?access_code=demo):

```
http://127.0.0.1:8000/index.html?access_code=demo
```

**4. Use the frontend**

- **Get suggestions from AI**: While writing in the text editor, press the `tab` key whenever you want to get suggestions. You can get suggestions multiple times in a row if you want more; you can navigate the suggestions using `arrow` keys and press the `enter` key to select a suggestion; to reopen the previous suggestions, press the `shift` key and `tab` key at the same time.
- **Save your writing session**: If you want to save the writing session (to share it with others or to replay it later), press the "Save your work" button on the bottom of the page and save the `SESSION_ID` you get; otherwise, your session will not be saved.
- **Replay your writing session**: To view the replay of your writing session, you can access it at `FRONTEND_URL/replay.html?session_id=SESSION_ID` where `FRONTEND_URL` is the URL of the frontend server and `SESSION_ID` is the session ID you received when you saved your writing session.

<div align="center">

<img src="https://p-lambda.github.io/coauthor/assets/images/pig_0.75_clip.gif" width="500px"/>

</div>

---

## Advanced Usage

**Access codes**

Each access code is mapped to a set of configurations (e.g. decoding parameters). You can create a new access code by adding a new row to `./config/access_codes.csv`. The following is an example of a row in `./config/access_codes.csv`:

| domain | example | prompt | access_code | session_length | n | max_tokens | temperature | top_p | presence_penalty | frequency_penalty | stop | engine | additional_data |
| ------ | ------- | ------ | ----------- | -------------- | - | ---------- | ----------- | ----- | ---------------- | ----------------- | ---- | ------ | --------------- |
| demo | na | na | demo | 0 | 5 | 50 | 0.95 | 1 | 0.5 | 0.5 | . | text-davinci-003 | na |


Parameters for experiments
- `domain`: The domain of the access code. This is used to group access codes together. For instance, you can create a new domain called `story` and add all access codes that are used for story writing to this domain.
- `example`: The part of a prompt that is hidden from users, designed to contain a set of examples for in-context learning. If you don't want to provide example(s), you can set this to `na`. Otherwise, you can provide multiple examples in `./config/examples` as a text file and refer to it here.
- `prompt`: The prompt that is shown to users in the text editor. If you don't want to provide a prompt, you can set this to `na`. Otherwise, you can add a prompt in `./config/prompts.tsv` refer to its `prompt_code` here.
- `access_code`: The access code that users need to enter to access the frontend. Choose a unique access code for each row.
- `session_length`: The minimum length of a writing session in seconds. After an user has written for this amount of time, the "Save your work" button will be enabled. If you don't want to set the time limit, you can set this to `0`.
- `additional_data`: Additional data that you want to connect with the session. Unless you have a specific use case, you can set this to `na`.


Parameters for OpenAI models (see [here](https://beta.openai.com/docs/api-reference/completions/create) for more details)
- `engine`: The engine used to generate suggestions (see [here](https://platform.openai.com/docs/models) for the list of supported models).
- `n`: The number of completions to generate for each prompt.
- `max_tokens`: The maximum number of tokens to generate in the completion.
- `temperature`: The temperature of the model. The higher the temperature, the more random the text.
- `top_p`: An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered.
- `presence_penalty`: Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
- `frequency_penalty`: Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
- `stop`: Up to 4 sequences where the API will stop generating further tokens. The returned text will not contain the stop sequence.

For `stop`, you can additionally use the following options to post-process model outputs:
- Leave it empty if you want a raw model output (e.g. it may include multiple empty lines).
- Put `.` if you want to show max one sentence for each suggestion.
- Put `\n` if you want to show max one paragraph for each suggestion.
- Use `|` to add multiple stop sequences (e.g. `.|\n|***`). You can have up to four stop sequences.

**Blocklist**

You can block certain words or phrases from being generated by the model by adding them to `./config/blocklist.txt` and setting `--use_blocklist` to be true when running the backend.
