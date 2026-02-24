import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

DataSet=pd.read_csv('data.csv')
X=DataSet.iloc[:,1:20].values
Y=DataSet.iloc[:,0].values

from sklearn.model_selection import train_test_split
X_train,X_test,Y_train,Y_test=train_test_split(X,Y,test_size=0.2,random_state=0)


from sklearn.preprocessing import StandardScaler
sc_X=StandardScaler()

X_train=sc_X.fit_transform(X_train)
X_test=sc_X.transform(X_test)

print(X_train)
from sklearn.ensemble import RandomForestClassifier
classifier=RandomForestClassifier(n_estimators=100,criterion='entropy',random_state=0)
classifier.fit(X_train,Y_train)
y_pred=classifier.predict(X_test)
print(y_pred)

from sklearn.metrics import accuracy_score,roc_auc_score,log_loss
print(accuracy_score(Y_test,y_pred))
print(roc_auc_score(Y_test,y_pred))
print(log_loss(Y_test,y_pred))

print(len(X_train[1]))