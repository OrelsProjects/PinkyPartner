## App description
This app is meant for people who want to have a training contract with their pal, so they will stick to training.
The app will allow users to create a contract, add obligations and sign up on it.

An obligation has:
A title and a description.
Each contract-bound obligation has a due date/interval+amount of times to interval, so the users will have their contract timed.

A contract has:
A due date, obligations, 2+ signatures from 2 different users.
Each user can either terminate the contract and by doing that it will be finished for the both of them.
Termination is modeled in the db, to know who did it and why.

A user can checkmark an obligation as done (Or recheck it to undo it) and that will send a notification to all those who partake in the contract.