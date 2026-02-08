import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import os

# --- Improved CNN Architecture ---
class GenderCNN(nn.Module):
    def __init__(self):
        super(GenderCNN, self).__init__()

        self.conv_layers = nn.Sequential(
            # Block 1
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(32),
            nn.MaxPool2d(2, 2),

            # Block 2
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(64),
            nn.MaxPool2d(2, 2),

            # Block 3 (New Layer for better features)
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(128),
            nn.MaxPool2d(2, 2)
        )

        self.fc_layers = nn.Sequential(
            nn.Flatten(),
            # Input to linear: 128 * (128/2/2/2) * (128/2/2/2) = 128 * 16 * 16
            nn.Linear(128 * 16 * 16, 256),
            nn.ReLU(),
            nn.Dropout(0.5), # Add dropout to prevent overfitting
            nn.Linear(256, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        x = self.conv_layers(x)
        x = self.fc_layers(x)
        return x

def main():
    print("--- Starting Improved CNN Training Loop ---")
    
    # Device configuration
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")

    # Set Paths - USER MUST ENSURE DATA IS IN THESE FOLDERS
    # Defaulting to a local 'dataset' folder in the current directory
    data_dir = 'dataset'
    train_path = os.path.join(data_dir, 'train')
    
    if not os.path.exists(train_path):
        print(f"ERROR: Training path not found at {train_path}")
        print("Please place your images in: dataset/train/Male and dataset/train/Female")
        return

    # Hyperparameters
    epochs = 10
    batch_size = 32
    learning_rate = 0.001
    
    # Transforms
    transform = transforms.Compose([
        transforms.Resize((128, 128)),
        transforms.RandomHorizontalFlip(), # Data augmentation
        transforms.ToTensor(),
        transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
    ])

    # Data Loader
    train_dataset = datasets.ImageFolder(root=train_path, transform=transform)
    dataloader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    
    print(f"Dataset found with classes: {train_dataset.classes}")
    # Note: Ensure Male is index 1 or adapt the mapping. Usually ImageFolder sorts alphabetically.
    # Female: 0, Male: 1 matches the original logic.

    # Initialize Model, Loss, and Optimizer
    model = GenderCNN().to(device)
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    
    # Training Loop
    model.train()
    for epoch in range(epochs):
        epoch_loss = 0
        correct = 0
        total = 0
        
        for images, labels in dataloader:
            images = images.to(device)
            labels = labels.float().unsqueeze(1).to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
            predictions = (outputs > 0.5).float()
            correct += (predictions == labels).sum().item()
            total += labels.size(0)
            
        avg_loss = epoch_loss / len(dataloader)
        accuracy = (correct / total) * 100
        print(f"Epoch [{epoch+1}/{epochs}] - Loss: {avg_loss:.4f} - Accuracy: {accuracy:.2f}%")

    # Save Model
    os.makedirs('models', exist_ok=True)
    torch.save(model.state_dict(), 'models/gender_model.pth')
    print("\nTraining Complete! Model saved to models/gender_model.pth")

if __name__ == '__main__':
    main()
