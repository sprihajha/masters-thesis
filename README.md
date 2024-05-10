# Appraise-Genie: Text and Image Analysis for Enhanced Property Valuation

This repository contains the code and resources for my thesis project, which focuses on developing a property valuation application. The application consists of a backend API built with Python and a user-friendly frontend implemented using Next.js.

## Project Overview

The goal of this thesis project is to create a web-based application that streamlines the property valuation process. The application allows users to input property details using a fillable format of Form 1004 and provides an estimated valuation based on the provided information.

## Repository Structure

The repository is organized into the following directories:

- `/api`: Contains the Flask backend implementation.
  - `app.py`: The main Python script that serves as the entry point for the API.
  - `1004_fillable.pdf`: The fillable format of Form 1004 used for property valuation.
  - `Metro_zhvi.csv`, `Metro_zori.csv`, `Zip_zhvi.csv`: Get updated Zillow Single-Family Housing data from their [website](https://www.zillow.com/research/data/).

- `/user-interface`: directory houses the Next.js application which provides a user-friendly interface for interacting with the appraisal system. It facilitates the appraisal process through a series of interactive pages, allowing users to input data and receive valuations.
  - `app/`: Next.js pages directory.
  - `components/`: React components used in the frontend.
  - `public/`: Public assets used in the frontend.

## Installation and Setup

To run the application locally, follow these steps:

1. Clone the repository

2. Navigate to the `/api` directory and install the required Python dependencies:

    ```bash
    cd api
    pip install -r requirements.txt
    ```

3. Start the backend API server:

    ```bash
    cd api
    flask run
    ```

4. In a separate terminal, navigate to the `/user-interface` directory and install the required Node.js dependencies:

    ```bash
    cd user-interface
    npm install
    ```

5. Start the Next.js development server:

    ```bash
    npm run dev
    ```

6. Configuring the Base URL: Replace the base URL in the frontend application with the local backend server URL. Ensure it points to the local instance of your Flask server, typically:

    ```javascript
    const baseURL = "http://localhost:5000";
    ```

7. Open your web browser and visit `http://localhost:3000` to access the application.

## Usage

1. Fill out the Form 1004 with the necessary property details.
2. Submit the form to receive an estimated valuation for the property.
3. Review the valuation results and any additional insights provided by the application.
