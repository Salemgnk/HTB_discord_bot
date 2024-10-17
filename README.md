
# H4ckf0rFUn - Discord Bot

H4ckf0rFUn is a custom Discord bot designed for cybersecurity enthusiasts and HackTheBox (HTB) users. The bot offers a set of features tailored to track user progress, display HTB profile details, and manage internal rankings based on user achievements.

## Features

- **HTB Account Linking**: Users can link their HackTheBox account to their Discord account to track their progress.
- **Progress Tracking**: Displays the number of machines owned, challenges solved, and overall ranking directly in the Discord server.
- **HTB Profile Details**: Users can view their HTB profile details, including rank, country ranking, global ranking, and more.
- **Automatic Role Assignment** *(Work in Progress)*: Roles based on HTB rank will be assigned automatically (this feature is not yet functional).
- **Internal Ranking System** *(Work in Progress)*: A leaderboard that ranks users on the server based on their HackTheBox progress is not yet operational.

## Commands

- `!linkhtb <HTB_ID>`  
  Link your HackTheBox account to your Discord account.
  
- `!progresshtb`  
  Display your current HTB progress, including the number of machines owned and challenges solved.
  
- `!progresshtb <username>`  
  View another user's HTB progress by specifying their Discord username (only for users who have linked their HTB account).

## Role Assignment *(Work in Progress)*

The bot will assign roles based on the HTB rank of the user. The ranks are:
- **E-Rank**: Noob (>= 0%)
- **D-Rank**: Script Kiddie (> 5%)
- **C-Rank**: Hacker (> 20%)
- **B-Rank**: Pro Hacker (> 45%)
- **A-Rank**: Elite Hacker (> 70%)
- **S-Rank**: Guru (> 90%)
- **Nation Rank**: Omniscient (100%)

## Known Issues

- **Leaderboard**: The internal ranking system for users based on HTB progress is currently under development and is not yet operational. Stay tuned for updates.
- **Auto Role Assignment**: Automatic role assignment based on HTB rank is not functional yet.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/H4ckf0rFUn.git
   ```

2. Install dependencies:
   ```bash
   npm install discord.js axios dotenv
   ```

3. Create a `.env` file in the root directory with your Discord bot token and HackTheBox API token:
   ```
   DISCORD_TOKEN=your_discord_token
   API_TOKEN=your_htb_api_token
   ```

4. Run the bot:
   ```bash
   node HtbBot.js
   ```

## Contribution

Feel free to contribute to the project by submitting issues or pull requests. Contributions are always welcome!

## License

This project is licensed under the MIT License.
