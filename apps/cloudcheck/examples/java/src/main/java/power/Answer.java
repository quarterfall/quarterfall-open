class Answer 
{
	double Power(double x, int n) 
	{
        double result = 1;
		for (int i = 0; i < n; i += 1) {
            result *= x;
        }
        return result;
	} 
} 