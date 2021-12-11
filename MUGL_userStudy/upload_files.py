import csv
import sys
import os
from random import sample, shuffle, randint
from shutil import copyfile
from annotation.models import ActionFiles, QuestionSet

def fill_database(filename):

    # Contains all action files 
    all_files = []
    files = os.listdir(filename)


    for action in files:
        folderName = os.path.join(filename, action, 'rotation')
        for sample in range(100):
            curr_file = os.path.join(folderName, 'sample' + str(sample) + '.json')
            all_files.append(curr_file)



    total_sets = 5
    total_questions = 60

    question_sets = []


    for i in range(total_sets):
        
        q = QuestionSet()
        q.save()

        shuffle(all_files)
        
        curr_set = all_files[:total_questions]

        for path in curr_set:
            action = path.split('/')[1]
            a = ActionFiles.objects.create(action = action, path = path)
            q.round1_files.add(a)

        q.save()

        all_files = all_files[total_questions:]
    