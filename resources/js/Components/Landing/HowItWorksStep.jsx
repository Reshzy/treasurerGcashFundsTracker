import { motion } from 'motion/react';

const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
};

export default function HowItWorksStep({ number, icon: Icon, title, description, index = 0 }) {
    return (
        <motion.div
            variants={item}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            transition={{
                duration: 0.5,
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1],
            }}
            className="relative flex flex-col items-center text-center"
        >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-accent-200 bg-accent-50 text-2xl font-bold text-accent-600 dark:border-accent-800 dark:bg-accent-900/30 dark:text-accent-400">
                {number}
            </div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 text-accent-600 dark:bg-accent-900/50 dark:text-accent-400">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {title}
            </h3>
            <p className="mt-2 max-w-xs text-sm text-slate-600 dark:text-slate-400">
                {description}
            </p>
        </motion.div>
    );
}
