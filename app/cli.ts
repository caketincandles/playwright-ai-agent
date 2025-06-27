import process from 'process';
import { Command } from 'commander';
import { SetupWizard } from '@app/setup/wizard';
import { ConfigSetup } from '@app/setup/config';
import { logger } from '@lib/services/logger';

const program = new Command()
    .name('playwright-ai-agent')
    .description('AI-powered Playwright automation')
    .version('1.0.0');

program
    .command('--init')
    .description('Setup configuration')
    .action(async () => {
        try {
            const wizard = new SetupWizard();
            const responses = await wizard.run();

            const writer = new ConfigSetup(responses);
            await writer.save();

            logger.dev.success('Setup complete!');
        } catch (error) {
            logger.dev.error('Setup failed', error);
            process.exit(1);
        }
    });

program.parse();
