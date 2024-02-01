SELECT
    "date",
    "time",
    "blockId",
    "blockfaceId",
    "cvlzId",
    "occupancy",
    "sensors"
FROM
    "Occupancy"
WHERE
    "date" LIKE '${dateLike}'
    AND "time" LIKE '${timeLike}'