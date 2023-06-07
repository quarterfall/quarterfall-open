# {{IMPORTS}}

# Quarterfall object containing the data
qf = {}

# Here, we're going to insert the function
# {{FUNC}}

def main():
    # read the data from QF json file if it exists
    if os.path.exists('qf.json'):
        json_file = open('qf.json')
        qf = json.load(json_file)

    # Add successful and failed test counts.
    qf['successfulTestCount'] = 0
    qf['failedTestCount'] = 0

    # run the tests
# {{TESTS}}

    # write the qf data to the json file
    outfile = open('qf.json', 'w')
    json.dump(qf, outfile)
  
if __name__== '__main__':
    main()