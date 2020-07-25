using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

namespace TopDomainChecker
{
    internal static class Program
    {
        private static void Main(string[] args)
        {
            Console.WriteLine($"Top Domain Checker v.{Assembly.GetExecutingAssembly().GetName().Version}\n(c) 2020 Potato1682.\n\n");

            if (args.Length == 0)
            {
                throw new ArgumentNullException("Missing argument");
            }

            int parcount = 0;
            bool isjob = false;

            if (args[1] == "-j")
            {
                parcount = int.Parse(args[2]);
                isjob = true;
            }

            List<string> successtopds = null;
            var topds = new StreamReader(args.Length < 3 ? args[3] : "./domains.txt").ReadToEnd().Split(" ");

            _ = Parallel.ForEach(topds, new ParallelOptions()
            {
                MaxDegreeOfParallelism = isjob ? Environment.ProcessorCount * 2 : parcount
            }, topd =>
            {
                try
                {
                    Console.Write($"Starting check \"{args[0]}.{topd}...");
                    var res = new Ping().Send(args[0] + "." + topd, 5);
                    if (res.Status != IPStatus.DestinationUnreachable || res.Status != IPStatus.DestinationHostUnreachable || res.Status != IPStatus.DestinationNetworkUnreachable)
                    {
                        successtopds = new();
                        successtopds.Add($"{args[0]}.{topd}");
                        Console.WriteLine("Success");
                    }
                    else
                    {
                        throw new SocketException();
                    }
                }
                catch
                {
                    Console.WriteLine("Fail");
                }
            });

            Console.WriteLine("\n\n<Summary>");
            if (successtopds == null)
                Console.WriteLine("[none]");
            foreach (var successtopd in successtopds)
            {
                Console.WriteLine(successtopd);
            }
            Console.WriteLine("\n");
        }
    }
}
