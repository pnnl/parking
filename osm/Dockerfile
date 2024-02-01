FROM overv/openstreetmap-tile-server:2.3.0

# import the region so that the base image already has data
COPY --chown=root:root ./region.osm.pbf /data/
RUN ./run.sh import;

# cleanup
RUN rm /data/region.osm.pbf

EXPOSE 80