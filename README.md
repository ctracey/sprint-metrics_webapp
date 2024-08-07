# Sprint Metrics Webapp

Tool to help generate metrics based on csv export from Jira.

This is lightweight web app solution designed to be run in the browser from local files.


## getting started

download [latest package](./_packages/), extract and open start.html in the browser

## how it works

Here is the process broken down into a few steps.
 - export csv from Jira for a sprint
 - load exported csv
 - collect additional data from user
 - download raw calculate stats as csv
 - load calculated stats csv into excel template to present dashboard of sprint metrics

You can see a few screenshots [here](./_other/screenshots)

## Under the hood

- html with css & javascript
- logs can be found by inspecting the browsers javascript console


- used Claude Sonnet 3.5 / ChatGPT / Perplexity to generate some code and fasttrack technology referencing
- using PapaParse lib


