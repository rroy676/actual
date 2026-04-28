import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  Dialog,
  Modal as ReactAriaModal,
  ModalOverlay,
} from 'react-aria-components';

import { useQueryClient } from '@tanstack/react-query';

import { Button, ButtonWithLoading } from '@actual-app/components/button';
import { theme } from '@actual-app/components/theme';
import { Text } from '@actual-app/components/text';
import { View } from '@actual-app/components/view';
import { send } from '@actual-app/core/platform/client/connection';

import { accountQueries } from '#accounts';
import { Checkbox } from '#components/forms';
import { useOnBudgetAccounts } from '#hooks/useOnBudgetAccounts';

import { Setting } from './UI';

export function CCTrackingSettings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const { data: accounts = [] } = useOnBudgetAccounts();

  const anyEnabled = accounts.some(a => !!a.credit_category);

  function invalidateAccounts() {
    void queryClient.invalidateQueries({ queryKey: accountQueries.lists() });
  }

  async function onDisableAll() {
    setIsDisabling(true);
    try {
      for (const account of accounts.filter(a => !!a.credit_category)) {
        await send('account-remove-cc-tracking', { id: account.id });
      }
      invalidateAccounts();
    } finally {
      setIsDisabling(false);
    }
  }

  async function onToggle(
    id: string,
    name: string,
    currentlyEnabled: boolean,
  ) {
    if (currentlyEnabled) {
      await send('account-remove-cc-tracking', { id });
    } else {
      await send('account-setup-cc-tracking', { id, name });
    }
    invalidateAccounts();
  }

  return (
    <Setting
      primaryAction={
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Button onPress={() => setShowOnboarding(true)}>
            {anyEnabled ? (
              <Trans>Manage Credit Card Accounts</Trans>
            ) : (
              <Trans>Set up Credit Card Payment Tracking</Trans>
            )}
          </Button>
          {anyEnabled && (
            <ButtonWithLoading isLoading={isDisabling} onPress={onDisableAll}>
              <Trans>Disable Credit Card Payment Tracking</Trans>
            </ButtonWithLoading>
          )}
        </View>
      }
    >
      <Text>
        <Trans>
          <strong>Credit Card Payment Tracking</strong> — When enabled for an
          account, Actual automatically calculates how much of your budgeted
          spending has been charged to that card and tracks how much you need
          to transfer to pay it off. You can still manually add extra to cover
          existing debt. Turning this on or off does not affect your existing
          transactions, categories, or budget history.
        </Trans>
      </Text>

      {showOnboarding && (
        <ModalOverlay
          isDismissable
          isOpen
          onOpenChange={open => !open && setShowOnboarding(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ReactAriaModal>
            <Dialog>
              <View
                style={{
                  backgroundColor: theme.modalBackground,
                  borderRadius: 8,
                  padding: 24,
                  minWidth: 340,
                  gap: 16,
                }}
              >
                <Text style={{ fontWeight: 600, fontSize: 16 }}>
                  <Trans>Select your credit card accounts</Trans>
                </Text>
                <View style={{ gap: 8 }}>
                  {accounts.map(account => (
                    <Text
                      key={account.id}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <Checkbox
                        id={`cc-onboard-${account.id}`}
                        checked={!!account.credit_category}
                        onChange={() =>
                          onToggle(
                            account.id,
                            account.name,
                            !!account.credit_category,
                          )
                        }
                      />
                      <label
                        htmlFor={`cc-onboard-${account.id}`}
                        style={{ marginLeft: 6 }}
                      >
                        {account.name}
                      </label>
                    </Text>
                  ))}
                </View>
                <Button onPress={() => setShowOnboarding(false)}>
                  <Trans>Done</Trans>
                </Button>
              </View>
            </Dialog>
          </ReactAriaModal>
        </ModalOverlay>
      )}
    </Setting>
  );
}
