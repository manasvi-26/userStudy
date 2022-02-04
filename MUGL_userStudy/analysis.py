from upload_files_2 import *        

q1 = QuestionSet.objects.get(pk=1)   
round1_files = q1.round1_files      
round1_files = round1_files.all() 
round1_files[0].path 