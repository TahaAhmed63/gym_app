// Mock reports data service

interface Member {
  id: number;
  name: string;
  phone: string;
  email: string;
  expiryDate?: string;
  dob?: string;
  daysLeft?: number;
}

export async function fetchExpiringMembers(timeframe: string): Promise<Member[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock expiring members
  const today = new Date();
  const members: Member[] = [];
  
  let minDays = 1;
  let maxDays = 3;
  
  switch (timeframe) {
    case '7days':
      minDays = 4;
      maxDays = 7;
      break;
    case '15days':
      minDays = 8;
      maxDays = 15;
      break;
    case '30days':
      minDays = 16;
      maxDays = 30;
      break;
    default: // '3days'
      minDays = 1;
      maxDays = 3;
  }
  
  // Generate between 3 and 10 members
  const count = Math.floor(Math.random() * 8) + 3;
  
  for (let i = 0; i < count; i++) {
    const id = i + 1;
    const daysLeft = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
    
    const expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + daysLeft);
    
    members.push({
      id,
      name: `Member ${id}`,
      phone: `98765${(10000 + id).toString().substring(1)}`,
      email: `member${id}@example.com`,
      expiryDate: expiryDate.toISOString(),
      daysLeft
    });
  }
  
  return members;
}

export async function fetchBirthdayMembers(): Promise<Member[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock upcoming birthdays
  const today = new Date();
  const members: Member[] = [];
  
  // Generate between 3 and 8 members
  const count = Math.floor(Math.random() * 6) + 3;
  
  for (let i = 0; i < count; i++) {
    const id = i + 1;
    const daysLeft = Math.floor(Math.random() * 15) + 1;
    
    const dob = new Date(today);
    dob.setDate(today.getDate() + daysLeft);
    // Set birth year in the past (25-45 years ago)
    dob.setFullYear(dob.getFullYear() - 25 - Math.floor(Math.random() * 20));
    
    members.push({
      id,
      name: `Member ${id}`,
      phone: `98765${(10000 + id).toString().substring(1)}`,
      email: `member${id}@example.com`,
      dob: dob.toISOString(),
      daysLeft
    });
  }
  
  return members;
}