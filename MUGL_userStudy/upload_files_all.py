import csv
import sys
import os
from random import sample, shuffle, randint
from shutil import copyfile
from annotation.models import ActionFiles, QuestionSet
from tqdm import tqdm

def fill_database(filename):


    mugl_folder = os.path.join(filename,"MUGL_ALL")
    truth_folder = os.path.join(filename,"GROUND_TRUTH")

    mugl = os.listdir(mugl_folder)
    truth = os.listdir(truth_folder)

    # mugl files 
    all_mugl_files = []
    for action in mugl:
        folderName = os.path.join(mugl_folder, action, 'rotation')
        for sample in range(100):
            curr_file = os.path.join(folderName, 'sample' + str(sample) + '.json')
            all_mugl_files.append(curr_file)

    # truth files
    all_truth_files = []
    for action in truth:
        folderName = os.path.join(truth_folder, action, 'rotation')
        for sample in range(10):
            curr_file = os.path.join(folderName, 'sample' + str(sample) + '.json')
            all_truth_files.append(curr_file)


    total_sets = 10
    total_questions = 10


    for i in range(total_sets):
        
        q = QuestionSet()
        q.save()

        shuffle(all_mugl_files)
        shuffle(all_truth_files)

        curr_set = all_mugl_files[:total_questions]

        # round 1 
        for path in curr_set:
            action = path.split('/')[2]
            a = ActionFiles.objects.create(action = action, path = path)
            q.round1_files.add(a)

        all_mugl_files = all_mugl_files[total_questions:]

        # round 2
        for i in range(total_questions):
        
            choice = randint(0,100)
            if choice < 50:
                path = all_mugl_files[0]
                action = path.split('/')[2]
                all_mugl_files = all_mugl_files[1:]
                a = ActionFiles.objects.create(action = action, path = path)
            
            else:
                path = all_truth_files[0]
                action = path.split('/')[2]
                all_truth_files = all_truth_files[1:]
                a = ActionFiles.objects.create(action = action, path = path, modelName= "TRUTH")

            q.round2_files.add(a)

        # round 3
        for i in tqdm(range(total_questions)):

            truth_path = all_truth_files[0]
            mugl_path = truth_path.replace( "GROUND_TRUTH", "MUGL_ALL")

            action = mugl_path.split('/')[2]
            all_truth_files = all_truth_files[1:]
            all_mugl_files = [i for i in all_mugl_files if i != all_mugl_files]

            a1 = ActionFiles.objects.create(action = action, path = mugl_path, modelName= "MUGL")
            a2 = ActionFiles.objects.create(action = action, path = truth_path, modelName= "TRUTH")
            
            q.round3_files.add(a1)
            q.round3_files.add(a2)

        q.save()

        print("ALL FILES IN Q ROUND3 ARE : ", q.round3_files.all())

# fill_database('action_files')

