# Macro Lighthouse

## Getting Started

Run the following command to install all necessary packages.

```bash
yarn
```

Copy the sample configuration file to create your own configuration file.

```bash
cp config.yaml.sample config.yaml
```

Open the configuration file in your preferred editor (here using vi) and adjust the settings as needed.

```bash
vi config.yaml
```

Below is an example configuration.

```yaml
numberOfRuns: 1 # The number of times to run the process for each URL.
urls:
  - https://www.google.com # List of URLs to be processed.
mobileOutputDir: ./mobile # Directory where mobile output files will be saved.
desktopOutputDir: ./desktop # Directory where desktop output files will be saved.
```

Run the following command to execute the collection and analysis process based on your.

```bash
yarn exec-collect-and-analyze
```

