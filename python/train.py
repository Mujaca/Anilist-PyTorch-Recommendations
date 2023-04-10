import torch
import torch.nn as nn
import torch.optim as optim
import json
import sys
import os

device = "mps" if torch.backends.mps.is_available() else "cpu"
device = torch.device(device)

# Load the JSON files
with open(os.getcwd() + '/python/data/' + sys.argv[1] + '/data.json', 'r') as f:
    data = json.load(f)

with open(os.getcwd() + '/python/data/' + sys.argv[1] + '/score.json', 'r') as f:
    score_data = json.load(f)


# Define the neural network model
class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.fc1 = nn.Linear(len(data[0]['keywords']) + len(data[0]['genres']) + len(data[0]['tags']), 10)
        self.fc2 = nn.Linear(10, 1)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)
        return x

# Convert the data into tensors
input_tensors = []
score_tensors = []
for i in range(len(data)):
    keywords_tensor = torch.tensor(data[i]['keywords'], dtype=torch.float32)
    genres_tensor = torch.tensor(data[i]['genres'], dtype=torch.float32)
    tags_tensor = torch.tensor(data[i]['tags'], dtype=torch.float32)
    score_tensor = torch.tensor(score_data[i], dtype=torch.float32)

    # Create the input tensor by concatenating the three feature tensors
    input_tensor = torch.cat([keywords_tensor, genres_tensor, tags_tensor])
    input_tensors.append(input_tensor)
    score_tensors.append(score_tensor)

# Create the neural network model
model = Net()

# Define the loss function and optimizer
criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=0.01)

# Train the model
for i in range(15000):
    total_loss = 0
    optimizer.zero_grad()
    for j in range(len(input_tensors)):
        output_tensor = model(input_tensors[j])
        loss = criterion(output_tensor, score_tensors[j])
        total_loss += loss
        loss.backward()

    optimizer.step()

    if i % 100 == 0:
        print("Epoch {}, Loss: {:.4f}".format(i, total_loss.item()))

torch.save(model.state_dict(), os.getcwd() + '/python/data/' + sys.argv[1] + '/model.pth')