TopDomainChecker
================

Brute-force the top-level domain with parallel.

# Overview

Makes the most of the thread pool and brute force the top level domain with multiple jobs.  
Verify the existence of the host using ICMP echo.

## Top-Level domain names

Top-level domains are getting the latest list from [IANA](https://data.iana.org/TLD/tlds-alpha-by-domain.txt). 

> **Note: I got the information from Wikipedia in Japan, but it's possible that the top-level domain isn't completely covered because Wikipedia displays a "contains outdated information" warning.**