<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">{{ t('finance.title') }}</div>
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          :label="t('finance.addTuition')"
          data-test="button-add-tuition"
          unelevated
          @click="tuitionDrawerOpen = true"
        />
        <q-btn
          color="primary"
          outline
          :label="t('finance.addPayment')"
          data-test="button-add-payment"
          @click="paymentDrawerOpen = true"
        />
      </div>
    </div>

    <q-banner v-if="!auth.tenantId" class="bg-warning text-dark" rounded data-test="banner-no-tenant">
      {{ t('tenant.selectHint') }}
    </q-banner>

    <q-linear-progress v-else-if="store.loading" indeterminate color="primary" class="q-mb-md" />
    <q-banner v-else-if="store.error" class="bg-negative text-white" rounded data-test="banner-error">
      {{ store.error }}
    </q-banner>

    <template v-else>
      <div class="text-subtitle1 q-mb-sm">{{ t('finance.tuitions') }}</div>
      <q-table
        v-if="store.tuitions.length"
        :rows="store.tuitions"
        :columns="tuitionColumns"
        row-key="id"
        flat
        bordered
        data-test="tuitions-table"
        :rows-per-page-options="[10, 25]"
      />
      <q-card v-else flat bordered class="q-pa-lg text-center q-mb-md" data-test="empty-tuitions">
        <div class="text-body2">{{ t('finance.emptyTuitions') }}</div>
      </q-card>

      <div class="text-subtitle1 q-mb-sm q-mt-md">{{ t('finance.payments') }}</div>
      <q-table
        v-if="store.payments.length"
        :rows="store.payments"
        :columns="paymentColumns"
        row-key="id"
        flat
        bordered
        data-test="payments-table"
        :rows-per-page-options="[10, 25]"
      />
      <q-card v-else flat bordered class="q-pa-lg text-center" data-test="empty-payments">
        <div class="text-body2">{{ t('finance.emptyPayments') }}</div>
      </q-card>
    </template>

    <q-drawer
      v-model="tuitionDrawerOpen"
      side="right"
      overlay
      bordered
      behavior="mobile"
      data-test="drawer-add-tuition"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="text-h6 q-mb-md">{{ t('finance.addTuition') }}</div>
          <q-form class="q-gutter-md" @submit="onSubmitTuition" data-test="form-add-tuition">
            <q-input
              v-model="tuitionForm.name"
              :label="t('finance.name')"
              outlined
              dense
              data-test="input-tuition-name"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-input
              v-model.number="tuitionForm.amount"
              type="number"
              step="0.01"
              :label="t('finance.amount')"
              outlined
              dense
              data-test="input-tuition-amount"
              :rules="[(v: number) => (v >= 0 && !Number.isNaN(v)) || t('validation.required')]"
            />
            <div class="row q-gutter-sm">
              <q-btn
                type="submit"
                color="primary"
                :label="t('submitForm.submit')"
                data-test="button-submit-tuition"
                unelevated
                :loading="store.loading"
              />
              <q-btn
                type="button"
                flat
                :label="t('submitForm.cancel')"
                data-test="button-cancel-tuition"
                @click="tuitionDrawerOpen = false"
              />
            </div>
          </q-form>
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-drawer
      v-model="paymentDrawerOpen"
      side="right"
      overlay
      bordered
      behavior="mobile"
      data-test="drawer-add-payment"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="text-h6 q-mb-md">{{ t('finance.addPayment') }}</div>
          <q-form class="q-gutter-md" @submit="onSubmitPayment" data-test="form-add-payment">
            <q-select
              v-model="paymentForm.studentId"
              :options="studentOptions"
              option-value="id"
              option-label="label"
              emit-value
              map-options
              :label="t('finance.student')"
              outlined
              dense
              data-test="select-payment-student"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-select
              v-model="paymentForm.tuitionId"
              :options="store.tuitions"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              :label="t('finance.tuition')"
              outlined
              dense
              data-test="select-payment-tuition"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <q-input
              v-model.number="paymentForm.amount"
              type="number"
              step="0.01"
              :label="t('finance.amount')"
              outlined
              dense
              data-test="input-payment-amount"
              :rules="[(v: number) => (v >= 0 && !Number.isNaN(v)) || t('validation.required')]"
            />
            <q-input
              v-model="paymentForm.paidAt"
              type="date"
              :label="t('finance.paidAt')"
              outlined
              dense
              data-test="input-payment-paidAt"
              :rules="[(v: string) => !!v || t('validation.required')]"
            />
            <div class="row q-gutter-sm">
              <q-btn
                type="submit"
                color="primary"
                :label="t('submitForm.submit')"
                data-test="button-submit-payment"
                unelevated
                :loading="store.loading"
              />
              <q-btn
                type="button"
                flat
                :label="t('submitForm.cancel')"
                data-test="button-cancel-payment"
                @click="paymentDrawerOpen = false"
              />
            </div>
          </q-form>
        </div>
      </q-scroll-area>
    </q-drawer>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useFinanceStore } from '@/stores/finance';
import { useStudentsStore } from '@/stores/students';

const { t } = useI18n();
const auth = useAuthStore();
const store = useFinanceStore();
const studentsStore = useStudentsStore();

const tuitionDrawerOpen = ref(false);
const paymentDrawerOpen = ref(false);
const tuitionForm = reactive({ name: '', amount: 0 });
const paymentForm = reactive({
  studentId: '',
  tuitionId: '',
  amount: 0,
  paidAt: new Date().toISOString().slice(0, 10),
});

const studentOptions = computed(() =>
  studentsStore.students.map((s) => ({
    id: s.id,
    label: `${s.indexNumber} ${s.firstName} ${s.lastName}`,
  })),
);

const tuitionColumns = [
  { name: 'name', label: 'Name', field: 'name', align: 'left' as const },
  { name: 'amount', label: 'Amount', field: 'amount', align: 'right' as const },
];

const paymentColumns = [
  { name: 'studentId', label: 'Student', field: 'studentId', align: 'left' as const },
  { name: 'amount', label: 'Amount', field: 'amount', align: 'right' as const },
  { name: 'paidAt', label: 'Paid at', field: (row: { paidAt: string }) => row.paidAt?.slice(0, 10) ?? '', align: 'left' as const },
];

function onSubmitTuition() {
  store
    .createTuition({ name: tuitionForm.name, amount: tuitionForm.amount })
    .then(() => {
      tuitionDrawerOpen.value = false;
      tuitionForm.name = '';
      tuitionForm.amount = 0;
    })
    .catch(() => {});
}

function onSubmitPayment() {
  store
    .createPayment({
      studentId: paymentForm.studentId,
      tuitionId: paymentForm.tuitionId,
      amount: paymentForm.amount,
      paidAt: new Date(paymentForm.paidAt).toISOString(),
    })
    .then(() => {
      paymentDrawerOpen.value = false;
      paymentForm.studentId = '';
      paymentForm.tuitionId = '';
      paymentForm.amount = 0;
      paymentForm.paidAt = new Date().toISOString().slice(0, 10);
    })
    .catch(() => {});
}

watch(
  () => auth.tenantId,
  (id) => {
    if (id) {
      store.fetchAll();
      studentsStore.fetchStudents();
    } else {
      store.clearFinance();
    }
  },
);

onMounted(() => {
  if (auth.tenantId) {
    store.fetchAll();
    studentsStore.fetchStudents();
  }
});
</script>
