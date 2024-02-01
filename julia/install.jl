using Pkg
packages = ["Parsers", "CSV", "DataFrames", "JuMP", "SCIP", "Gurobi", "JSON"]
Pkg.add(packages)
Pkg.instantiate()
Pkg.precompile()