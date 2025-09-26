import liff from '@line/liff';

// LINE Login Configuration
export const LINE_CONFIG = {
  channelId: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
  liffId: process.env.NEXT_PUBLIC_LINE_LIFF_ID || '',
  redirectUri: process.env.NEXT_PUBLIC_LINE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/line/callback`,
};

// LIFF Initialization
export const initLiff = async (): Promise<boolean> => {
  try {
    await liff.init({ liffId: LINE_CONFIG.liffId });
    return true;
  } catch (error) {
    console.error('LIFF initialization failed:', error);
    return false;
  }
};

// Check if user is logged in via LINE
export const isLineLoggedIn = (): boolean => {
  try {
    return liff.isLoggedIn();
  } catch (error) {
    console.error('Error checking LINE login status:', error);
    return false;
  }
};

// Get LINE user profile
export const getLineProfile = async () => {
  try {
    if (!liff.isLoggedIn()) {
      throw new Error('User is not logged in');
    }
    return await liff.getProfile();
  } catch (error) {
    console.error('Error getting LINE profile:', error);
    throw error;
  }
};

// LINE Login
export const lineLogin = () => {
  try {
    liff.login({
      redirectUri: window.location.href,
    });
  } catch (error) {
    console.error('LINE login failed:', error);
    throw error;
  }
};

// LINE Logout
export const lineLogout = () => {
  try {
    liff.logout();
  } catch (error) {
    console.error('LINE logout failed:', error);
    throw error;
  }
};

// Get LINE Access Token
export const getLineAccessToken = (): string | null => {
  try {
    return liff.getAccessToken();
  } catch (error) {
    console.error('Error getting LINE access token:', error);
    return null;
  }
};

// Check if running in LINE app
export const isInClient = (): boolean => {
  try {
    return liff.isInClient();
  } catch (error) {
    console.error('Error checking if in LINE client:', error);
    return false;
  }
};

// Close LIFF window (when running in LINE app)
export const closeLiffWindow = () => {
  try {
    if (liff.isInClient()) {
      liff.closeWindow();
    }
  } catch (error) {
    console.error('Error closing LIFF window:', error);
  }
};

// Send message to LINE chat (LIFF only)
export const sendLineMessage = async (message: string) => {
  try {
    if (!liff.isInClient()) {
      throw new Error('This function only works in LINE app');
    }
    
    await liff.sendMessages([
      {
        type: 'text',
        text: message,
      },
    ]);
  } catch (error) {
    console.error('Error sending LINE message:', error);
    throw error;
  }
};

// Share target picker (LIFF only)
export const shareTargetPicker = async (message: string) => {
  try {
    if (!liff.isInClient()) {
      throw new Error('This function only works in LINE app');
    }

    const result = await liff.shareTargetPicker([
      {
        type: 'text',
        text: message,
      },
    ]);

    if (result) {
      console.log('Message shared successfully');
    } else {
      console.log('Share cancelled');
    }
  } catch (error) {
    console.error('Error sharing message:', error);
    throw error;
  }
};

// Add friend to LINE Official Account (LIFF only)
export const addFriend = async () => {
  try {
    if (!liff.isInClient()) {
      throw new Error('This function only works in LINE app');
    }

    // This will show the Add Friend dialog
    const result = await liff.permanentLink.createUrl();
    window.open(`https://line.me/R/ti/p/${LINE_CONFIG.channelId}`, '_blank');
    console.log('Add friend dialog shown');
  } catch (error) {
    console.error('Error showing add friend dialog:', error);
    throw error;
  }
};

// Check if user is friend with the LINE Official Account
export const isFriend = async (): Promise<boolean> => {
  try {
    if (!liff.isInClient()) {
      return false;
    }
    
    const friendship = await liff.getFriendship();
    return friendship.friendFlag;
  } catch (error) {
    console.error('Error checking friendship status:', error);
    return false;
  }
};