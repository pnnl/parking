FROM jupyter/datascience-notebook:julia-1.6.1
WORKDIR /home/jovyan/
COPY --chown=root:root ./install.jl ./install.jl
RUN julia install.jl
RUN pip install --no-deps Flask werkzeug itsdangerous
COPY --chown=root:root ./web.py ./web.py
COPY --chown=root:root --chmod=005 ./startup.sh ./startup.sh
COPY --chown=root:root ./process.sh ./process.sh
COPY --chown=root:root ./servable_model/SeattleJN.ipynb ./work
COPY --chown=root:root ./servable_model/space_val_data ./work/space_val_data
# external declarations
EXPOSE 8888
EXPOSE 5000
# start app
WORKDIR /home/jovyan/
CMD ./startup.sh