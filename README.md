# QuestLog - A Game Backlog Web Application - Algorithms Project

## Description
A project assigned to us by Matthew Harrison that must address atleast on of the following learning objectives.

* Explain the use of asymptotic notation and complexity theory in describing the amount of work done by an algorithm.
* Demonstrate an understanding of proof techniques used to prove algorithmic correctness.
* Use and solve recurrence relations to determine the time complexity of recursively defined algorithms.
* Given a problem, determine an appropriate algorithmic strategy and data structure to solve the problem efficiently.
* Describe models of computation and their relationship to complexity classes and the analysis of algorithms.

## How to install
Download the repository and extract.

Install Python Prereqs: `pip install requests ast fastapi pydantic starlette uvicorn`

Note: This should be all of the packages that need to be installed that are not bundled with Python by default.

Install Node Prereqs (if needed, may already be attached in this repository): `npm install express cors node-fetch`

## How to use
From the project root:
Start the web server:
`node .\Web_Application\server.js`

Start the web API:
`uvicorn Game_API.main:app --reload --host 0.0.0.0 --port 8000`

Open the webpage located at: `Web_Application/public/index.html`


## Tools & APIs
[IGDB API](https://api-docs.igdb.com/#getting-started)
### Python Libaries
- requests
- sqlite3
- ast
- fastapi
- pydantic
- starlette
- uvicorn
- os
- subprocess
- json
### Node Libraries
- cors
- express
- node-fetch
    

`Add Other Libraries`

## Contributors
[Nicholas Crump](https://github.com/Kataruse)

[Nicholas Trahan](https://github.com/NicholasTrahan)

[Will Paxton](https://github.com/willpaxton)
