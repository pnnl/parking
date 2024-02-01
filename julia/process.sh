#!/bin/bash

# Run the Jupyter Notebook
cd /home/jovyan/
jupyter nbconvert --to notebook --execute ./work/SeattleJN.ipynb --output=results.ipynb
