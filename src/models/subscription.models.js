import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        subscriber: {
            type: mongoose.Schema.Types.ObjectId, // one who is subscribing
            ref: "User",
        },

        channel: {
            type: mongoose.Schema.Types.ObjectId, // one to whom subscriber is subscribing
            ref: "User",
        },
    },
    { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

/*
UNDERSTANDING THE SUBSCRIPTION SCHEMA
_____________________________________

The two main points are 
--> subscriber
--> channel

Suppose we have some users and some channels... (at the very core, both 'subscribers' and 'channels' are users only)

say, 🧑 users: a, b, c, d, e
say, 📺 channels: CAC, HCC, FCC

each time a user subscribes to a channel, a new document gets created.
each document that gets created will look like this: 
______________________
[     Document_*     ]
[                    ]
[  channel -> ...    ]
[  subscriber -> ... ]
______________________

now, suppose we have some documents for some users who have subscribed to some channels

➡️ subscriber 'a' subscribed to channel 'CAC', one document gets created
______________________
[     Document_1     ]
[                    ]
[  channel -> CAC    ]
[  subscriber -> a   ]
______________________

➡️ subscriber 'b' subscribed to channel 'CAC', one document gets created
______________________
[     Document_2     ]
[                    ]
[  channel -> CAC    ]
[  subscriber -> b   ]
______________________

➡️ subscriber 'c' subscribed to channel 'CAC', one document gets created
➡️ subscriber 'c' subscribed to channel 'HCC', one document gets created
➡️ subscriber 'c' subscribed to channel 'FCC', one document gets created
______________________
[     Document_3     ]
[                    ]
[  channel -> CAC    ]
[  subscriber -> c   ]
______________________

______________________
[     Document_4     ]
[                    ]
[  channel -> HCC    ]
[  subscriber -> c   ]
______________________

______________________
[     Document_5     ]
[                    ]
[  channel -> FCC    ]
[  subscriber -> c   ]
______________________

📝 Now, in order to find out that how many 'subscribers' does the channel 'CAC' have, we count the number of documents in the DB which have 'CAC' in the field of 'channel'... ie, Doc_1, Doc_2 & Doc_3. Thus, the channel 'CAC' has '3 subscribers'.

📝 And, in order to find out that how many 'channels' does the user 'c' have subscribed to, we count the number of documents in the DB which have 'c' in the field of 'subscriber'
*/