import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import React from 'react';

const ctx = require.context('./src/app');

export function App() {
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
