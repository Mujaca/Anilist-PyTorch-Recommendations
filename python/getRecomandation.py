import torch
import torch.nn as nn
import torch.optim as optim
import json
import sys
import os

class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.fc1 = nn.Linear(len(data[0]['keywords']) + len(data[0]['genres']) + len(data[0]['tags']), 10)
        self.fc2 = nn.Linear(10, 1)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)
        return x


#Load JSON Data
with open(os.getcwd() + '/python/data/toCheck.json', 'r') as f:
    data = json.load(f)

#Load Model
model = Net()
model.load_state_dict(torch.load(os.getcwd() + '/python/data/' + sys.argv[1] + '/model.pth'))
model.eval()

# create array for data
dataArr = [0] * len(data)
for i in range(len(data)):
    keywords_tensor = torch.tensor(data[i]['keywords'], dtype=torch.float32)
    genres_tensor = torch.tensor(data[i]['genres'], dtype=torch.float32)
    tags_tensor = torch.tensor(data[i]['tags'], dtype=torch.float32)
    input_tensor = torch.cat([keywords_tensor, genres_tensor, tags_tensor])

    new_score_tensor = model(input_tensor)
    predicted_score = int(new_score_tensor.item())
    dataArr[i] = predicted_score


json_object = json.dumps(dataArr)
with open(os.getcwd() + '/python/data/' + sys.argv[1] + '/recommandations.json', "w") as outfile:
    json.dump(json_object, outfile)