# AACCAA-app



<p align="center"><img width="526" alt="Screenshot 2023-08-24 alle 20 43 11" src="https://github.com/Camilla9347/AACCAA-app/assets/50362663/df566c72-ef7a-4fe2-9d1b-71eae14fb061"></p>

**The Process**

The main process of the application, which coincides with the *Process centric* services layer consists in the user, mostly the care giver, *Registration/Login* and then the possibility to perform the following operations: 

* *Create a sentence*, made up of three pictograms of choice, by typing the corresponding *subject*, *verb* and *object* sentence parts in their request, along with a *language* specification. Currently, the available languages are Italian ("it"), English ("en") and French ("fr").
  
* *Get all sentences*. The user, care-giver, together with the care-receiver, can visually inspect all the sentences, which can make sense on their own, or in the listed order of creation as a comprehensive story. They can also know the number of sentences and gain access to each single sentence, through the provided database ID.
  
* *Get a single sentence*, by specifying its database ID. In this way, the user, especially the care-receiver, can visually detect each sentence pictogram and look at the s-v-o structure. Each pictogram-associated image can be scrutinized to relate it to its matching meaning and also the sound can be played to enrich the visual aid with a vocal support. In this way, the care-receiver gains a deeper knowledge of each sentence and, as a consequence, the caregiver may decide to update the sentence to highlight a possible change or different perspective or, also, if the sentence is no longer of use, to delete it.
  
* *Update a sentence*, by specifying its database ID. The user, mostly the caregiver, has to re-type the whole sentence, even if they only want to change one sentence part. In this case, the language specification is not provided, since updating only relates to the meaning, or word, corresponding to either *subject*, *verb*, or *object*. Changing the language would break the continuity of the previously activated learning process, before the update was taken into consideration.
  
* *Delete a sentence*, by specifying its database ID. In this way, overused sentences, or sentences that are finally fully comprehended by the care-receiver, can be deleted from the list in favour of more complex ones. This approach may metaphorically reflect the flexibility and transient nature of speech, without having to manually destroy each paper-made pictogram that makes up the sentence to be deleted in reality.
  
When the user is satisfied with the performed operations, they can log out of the application.
The Authentication workflow is deemed as necessary, since the application has to handle each user' set of sentences and this data can be included in the group of sensible or private information, depending on each family or professional decision on what to disclosure about their relatives and patients.


**Running the project**

To run the application type

```
$ npm start
```
within the AACCAA-app folder

**Note**

The Authentication workflow and the general Express Web Framework was developed following the *NodeJS Tutorial and Projects Course*, created by John Smilga (https://github.com/john-smilga) for the udemy online learning and teaching marketplace.
Also the https://github.com/john-smilga/node-express-course.git repository was found to be very useful in the development phase.

