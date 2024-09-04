# -*- coding: utf-8 -*-
"""
Spyder Editor

This is a temporary script file.
"""
import pypsa
network=pypsa.Network()
nbus=12
for i in range(nbus):
    network.add("Bus","Bus No {}".format(i),v_nom=132)
for i in range(nbus-1):
    if(i==0):
        network.add("Line","line {}".format(i),bus0="Bus No {}".format(i),bus1="Bus No {}".format(i+1),r=0.455,x=1.093)
        i=i+1
        if(i==1):
            network.add("Line","line {}".format(i),bus0="Bus No {}".format(i),bus1="Bus No {}".format(i+1),r=0.000494,x=0.001184)
            i=i+1
            if(i==2):
                network.add("Line","line {}".format(i),bus0="Bus No {}".format(i),bus1="Bus No {}".format(i+1),r=0.000873,x=0.002095)
                i=i+1
                if(i==3):
                    network.add("Line","line {}".format(i),bus0="Bus No {}".format(i),bus1="Bus No {}".format(i+1),r=0.001329,x=0.003188)
                    i=i+1
                    if(i==4):
                        network.add("Line","line {}".format(i),bus0="Bus No {}".format(i),bus1="Bus No {}".format(i+1),r=0.000455,x=0.001093)
                        i=i+1
                        if(i==5):
                            network.add("Line","line {}".format(i),bus0="Bus No {}".format(i),bus1="Bus No {}".format(i+1),r=0.000417,x=0.001002)
                            i=i+1
                            if(i==6):
                                network.add("Line","line {}".format(i),bus0="Bus No {}".format(i),bus1="Bus No {}".format(i+1),r=0.001215,x=0.004403)
                                i=i+1
                                if(i==7):
                                    network.add("Line","line {}".format(i),bus0="Bus No {}".format(i),bus1="Bus No {}".format(i+1),r=0.001597,x=0.005642)
                                    i=i+1
                                    if(i==8):
                                        network.add("Line","line {}".format(i),bus0="Bus No {}".format(i),bus1="Bus No {}".format(i+1),r=0.000818, x=0.00289)
                                        i=i+1
                                        if(i==9):
                                            network.add("Line","line {}".format(i),bus0="Bus No {}".format(i),bus1="Bus No {}".format(i+1),r=0.000428,x=0.001514)
                                            i=i+1
                                            if(i==10):
                                                network.add("Line","line {}".format(i),bus0="Bus No {}".format(i),bus1="Bus No {}".format(i+1),r=0.00351,x=0.001238)
network.add("Generator","slack Gen",bus="Bus No 0",p_set=0,control="slack")
network.add("Load","Load No 1",bus="Bus No 1",p_set=60,q_set=60)
network.add("Load","Load No 2",bus="Bus No 2",p_set=40,q_set=30)
network.add("Load","Load No 3",bus="Bus No 3",p_set=55,q_set=55)
network.add("Load","Load No 4",bus="Bus No 4",p_set=30,q_set=30)
network.add("Load","Load No 5",bus="Bus No 5",p_set=20,q_set=15)
network.add("Load","Load No 6",bus="Bus No 6",p_set=55,q_set=55)
network.add("Load","Load No 7",bus="Bus No 7",p_set=45,q_set=45)
network.add("Load","Load No 8",bus="Bus No 8",p_set=40,q_set=40)
network.add("Load","Load No 9",bus="Bus No 9",p_set=35,q_set=30)
network.add("Load","Load No 10",bus="Bus No 10",p_set=40,q_set=30)
network.add("Load","Load No 11",bus="Bus No 11",p_set=15,q_set=15)
network.pf()
print(network.lines_t.p0)
print(network.buses_t)


