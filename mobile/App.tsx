import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppWrapper from './src/components/AppWrapper';

export default function App() {
  return (
    <>
      <AppWrapper />
      <StatusBar style="light" />
    </>
  );
}