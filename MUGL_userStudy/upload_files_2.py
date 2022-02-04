import csv
import sys
import os
import random
from random import  shuffle, randint
from shutil import copyfile
import re
from annotation.models import ActionFiles, QuestionSet
from tqdm import tqdm

person1 = set()
person2 = set()

def fill_actionSet():

    global person1
    f = open('person1_actionNames.txt','r')
    lines = f.readlines()
    for line in lines:
        line = re.sub('\s+','',line)
        person1.add(line)
    
    global person2
    f = open('person2_actionNames.txt', 'r')
    lines = f.readlines()
    for line in lines:
        line = re.sub('\s+','',line)
        person2.add(line)


def sampling_dict():

    mugl_actions = dict()
    truth_actions = dict()
    
    for action in person1:
        mugl_actions[action] = []
        truth_actions[action] = []

        for i in range(5):
            mugl_actions[action].append(i)
            truth_actions[action].append(i)
        
        shuffle(mugl_actions[action])
        shuffle(truth_actions[action])


    for action in person2:

        mugl_actions[action] = []
        truth_actions[action] = []

        for i in range(5):
            mugl_actions[action].append(i)
            truth_actions[action].append(i)
        
        shuffle(mugl_actions[action])
        shuffle(truth_actions[action])

    return mugl_actions, truth_actions


def pick_action(single_person_only=False):
    global person1
    global person2

    choice = randint(0,100)
    person = -1
    if single_person_only == True: choice = 0
    if choice < 70:
        action = random.sample(person1, k=1)[0]
        person1.remove(action)
        person = 1
    else:
        action = random.sample(person2, k=1)[0]
        person2.remove(action)
        person = 2

    return person, action
    

def fill_database(filename):
    
    fill_actionSet()

    mugl_actions, truth_actions = sampling_dict()

    total_sets = 5

    for i in range(total_sets):
        fill_actionSet()
        q = QuestionSet()
        q.save()

        #round 1:
        #pick action
        
        for i in range(5):
            
            person, action = pick_action(single_person_only=True)
            sample = mugl_actions[action].pop()
            path = os.path.join(filename, "MUGL","person_"+str(person) ,action,"rotation", "sample"+str(sample) + ".json" )

            #picking options:
            options = random.sample(person1, k=3)
            options.append(action)
            shuffle(options)

            a = ActionFiles.objects.create(action = action, path = path, person=person
                                            , option1=options[0]
                                            , option2=options[1]
                                            , option3=options[2]
                                            , option4=options[3]
                
                )
            q.round1_files.add(a)


        #round 2:
        #pick action

        action_paths = []
        for i in range(3):

            person, action = pick_action(single_person_only=True)
            sample = mugl_actions[action].pop()
            path = os.path.join(filename, "MUGL","person_"+str(person) ,action,"rotation", "sample"+str(sample) + ".json" )
            action_paths.append((path, action, person))
            a = ActionFiles.objects.create(action = action, path = path, person=person)
            q.round2_files.add(a)


        for i in range(3):
            
            person, action = pick_action(single_person_only=True)
            sample = mugl_actions[action].pop()
            path = os.path.join(filename, "GROUND_TRUTH","person_"+str(person) ,action,"rotation", "sample"+str(sample) + ".json" )
            action_paths.append((path, action, person))

        shuffle(action_paths)
        ##*** Over here add to question set ***
        for item in action_paths:
            path, action, person = item[0], item[1], item[2]
            a = ActionFiles.objects.create(action = action, path = path, person=person)
            q.round2_files.add(a)

        
        #round 3
        #pick action
        for i in range(5):
            person, action = pick_action(single_person_only=True)
            sample1 = mugl_actions[action].pop()
            sample2 = truth_actions[action].pop()
            mugl_path = os.path.join(filename, "MUGL","person_"+str(person) ,action,"rotation", "sample"+str(sample1) + ".json" )
            truth_path = os.path.join(filename, "GROUND_TRUTH","person_"+str(person) ,action,"rotation", "sample"+str(sample2) + ".json" )


            a1 = ActionFiles.objects.create(action = action, path = mugl_path, modelName= "MUGL")
            a2 = ActionFiles.objects.create(action = action, path = truth_path, modelName= "TRUTH")
            
            q.round3_files.add(a1)
            q.round3_files.add(a2)



fill_database('media/action_files')
    

