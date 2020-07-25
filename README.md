TopDomainChecker
================

Brute-force the top-level domain with parallel.

# Overview

Makes the most of the thread pool and brute force the top level domain with multiple jobs.  
Verify the existence of the host using ICMP echo.

## Top-Level domain names

The top level domain is described in [domains.txt](domains.txt) from [Wikipedia](https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains) \[[ja](https://ja.wikipedia.org/wiki/%E3%83%88%E3%83%83%E3%83%97%E3%83%AC%E3%83%99%E3%83%AB%E3%83%89%E3%83%A1%E3%82%A4%E3%83%B3%E4%B8%80%E8%A6%A7)\].  

**Note: I got the information from Wikipedia in Japan, but it's possible that the top-level domain isn't completely covered because Wikipedia displays a "contains outdated information" warning.**

## Parallel proceccing mechanism

For parallel processing, `Parallel.ForEach()` function of `System.Threading.Tasks` library of C# is used.  
The number of jobs is specified in the `ParallelOptions` class and the process is run for each item in the collection.

## Why didn't add .onion?

Tor links are certainly useful to find on brute force, but **some may even harbor dangerous servers**.  
Sending ICMP packets to a dangerous server is not described in domains.txt as it is a **vulnerable act of logging IP addresses**.
