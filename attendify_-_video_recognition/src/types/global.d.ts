declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
        };
      };
    };
  }
}

export {};
