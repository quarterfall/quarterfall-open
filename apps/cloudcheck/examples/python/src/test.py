import json
import os.path
import unittest

from answer import power

# Quarterfall object containing the data
qf = {}


class TestStringMethods(unittest.TestCase):

    # test to check whether the power is correctly computed
    def test_power(self):
        try:
            self.assertEqual(power(2, 4), 16)
            qf['powerCorrect'] = True
        except:
            qf['powerCorrect'] = False
            raise

    # test to check whether the power is correctly computed for non-integers
    def test_power_non_integer(self):
        try:
            self.assertEqual(power(1.5, 3), 3.375)
            qf['powerNonIntegerCorrect'] = True
        except:
            qf['powerNonIntegerCorrect'] = False
            raise

    # test to check whether the power is correctly computed if n equals 0
    def test_power_zero(self):
        try:
            self.assertEqual(power(50, 0), 1)
            qf['powerZero'] = True
        except:
            qf['powerZero'] = False
            raise

    @classmethod
    def setUpClass(cls):
        # read the data from QF json file if it exists
        if os.path.exists('qf.json'):
            json_file = open('qf.json')
            qf = json.load(json_file)
            json_file.close()

    @classmethod
    def tearDownClass(cls):
        # write the qf data to the json file
        outfile = open('qf.json', 'w')
        json.dump(qf, outfile)
        outfile.close()


if __name__ == '__main__':
    unittest.main()
