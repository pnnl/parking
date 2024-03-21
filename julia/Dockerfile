FROM jupyter/datascience-notebook:julia-1.6.1
RUN pip install --no-deps Flask werkzeug itsdangerous
WORKDIR /home/jovyan/
COPY --chown=jovyan:jovyan ./install.jl ./install.jl
RUN julia install.jl
COPY --chown=jovyan:jovyan . .
RUN chmod 755 ./startup.sh ./process.sh
RUN cp ./servable_model/SeattleJN.ipynb ./work/SeattleJN.ipynb
RUN cp -r ./servable_model/space_val_data/ ./work/space_val_data/
COPY --chown=root:root ./web.py ./web.py
COPY --chown=root:root --chmod=005 ./startup.sh ./startup.sh
COPY --chown=root:root --chmod=005 ./process.sh ./process.sh
COPY --chown=root:root ./servable_model/SeattleJN.ipynb ./work
COPY --chown=root:root ./servable_model/space_val_data ./work/space_val_data
# external declarations
EXPOSE 8888
EXPOSE 5000
# start app
WORKDIR /home/jovyan/
CMD ./startup.sh
