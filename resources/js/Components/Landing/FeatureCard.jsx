import { motion } from 'motion/react';

const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
};

export default function FeatureCard({ icon: Icon, title, description, index = 0 }) {
    return (
        <motion.div
            variants={item}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-lg backdrop-blur-sm transition-shadow hover:border-accent-200 hover:shadow-xl dark:border-slate-700/80 dark:bg-slate-800/90 dark:hover:border-accent-800/50"
        >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-accent-100 text-accent-600 transition-colors group-hover:bg-accent-200 dark:bg-accent-900/50 dark:text-accent-400 dark:group-hover:bg-accent-900/70">
                <Icon className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {title}
            </h3>
            <p className="mt-3 text-slate-600 dark:text-slate-400">{description}</p>
        </motion.div>
    );
}
