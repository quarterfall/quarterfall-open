double power(double x, int n)
{
    double result = 1;
    for (int i = 0; i < n; i++) {
        result *= x;
    }
    return result;
}