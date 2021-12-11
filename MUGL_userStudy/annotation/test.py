class Test1():
    def __init__(self):
        print("hello from 1")

    def func1(self):
        print("from func1")


class Test2():
    def __init__(self):
        print("hello from 2")

    def func2(self):
        print("from func2")


var = Test1
obj = var()

method = getattr(obj,"func1")
print(method)

