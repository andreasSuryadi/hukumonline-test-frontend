<template>
  <div>
    <!-- For Import/Export Data -->
    <div class="level">
      <div class="level-left"></div>
      <div class="level-right">
        <b-upload v-model="file" type="is-primary" @input="importExcel()">
          <a class="button btn-import is-primary">
            <b-icon icon="file-import" size="is-small"></b-icon>&nbsp;
            <span>Import</span>
          </a>
        </b-upload>
      </div>
    </div>
    <!-- End For Import/Export Data -->

    <!-- For search or filter -->
    <div class="level">
      <div class="level-left">
        <b-field label="Group By">
          <b-radio-button
            native-value="dealer"
            type="is-primary is-light is-outlined"
            v-model="filterBy"
          >
            Dealer Name
          </b-radio-button>

          <b-radio-button
            native-value="car_brand"
            type="is-primary is-light is-outlined"
            v-model="filterBy"
          >
            Car Brand
          </b-radio-button>

          <b-radio-button
            native-value="car_model"
            type="is-primary is-light is-outlined"
            v-model="filterBy"
          >
            Car Model
          </b-radio-button>
        </b-field>
      </div>
      <div class="level-right">
        <b-field label="Find Product">
          <b-input
            v-model="search"
            placeholder="Search..."
            type="search"
            icon="search"
          ></b-input>
        </b-field>
      </div>
    </div>
    <!-- End For Search or Filter -->

    <!-- For filter checkbox -->
    <div class="columns">
      <div class="column is-5">
        <b-field label="Issue">
          <b-checkbox v-model="isZeroStock"
            >Only products with zero stock</b-checkbox
          >
        </b-field>
      </div>
      <div class="column is-3">
        <b-field label="Time Preview">
          <b-datepicker placeholder="Click to select..." v-model="dates" range>
          </b-datepicker>
        </b-field>
      </div>
      <div class="column is-4">
        <b-field grouped position="is-right">
          <b-select v-model="perPage" @input="onPerPageChange">
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="15">15 per page</option>
            <option value="20">20 per page</option>
          </b-select>
        </b-field>
      </div>
    </div>
    <!-- End For filter checkbox -->

    <!-- For List Data Stock -->
    <template v-if="!isLoading">
      <b-table
        v-if="!isLoading"
        :data="stocks && stocks.data ? stocks.data : []"
        :current-page.sync="currentPage"
        paginated
        backend-pagination
        :total="stocks.meta && stocks.meta.total ? stocks.meta.total : 0"
        :per-page="perPage"
        @page-change="onPageChange"
        aria-next-label="Next page"
        aria-previous-label="Previous page"
        aria-page-label="Page"
        aria-current-label="Current page"
        backend-sorting
        :sticky-header="stickyHeaders"
        :bordered="isBordered"
        :default-sort-direction="defaultSortOrder"
        :default-sort="[sortField, sortOrder]"
        @sort="onSort"
        detail-key="id"
      >
        <!-- For Dealer -->
        <b-table-column
          field="dealers.name"
          label="Dealer"
          sortable
          v-slot="props"
          sticky
          width="10%"
        >
          {{ props.row.dealer }}
        </b-table-column>

        <!-- For Car Brand -->
        <b-table-column
          field="car_brands.name"
          label="Car Brand"
          sortable
          v-slot="props"
          sticky
          width="10%"
        >
          {{ props.row.carBrand }}
        </b-table-column>

        <!-- For Car Model -->
        <b-table-column
          field="car_models.name"
          label="Car Model"
          sortable
          v-slot="props"
          sticky
          width="10%"
        >
          {{ props.row.carModel }}
        </b-table-column>

        <!-- For list date -->
        <b-table-column v-for="(date, index) in dateRange" :key="index" width="5%">
          <template v-slot:header="{ column }">
            <div :label="column.label">
              <p class="has-text-centered">
                {{ formatDate(date, "ddd") }}
                <br />
                {{ formatDate(date, "DD") }}
              </p>
            </div>
          </template>

          <template v-slot="props">
            <template v-if="getStockData(props.row.stocks, date) == null">
              <div class="product-zero">
                0
              </div>
            </template>
            <template v-else>
              <div class="product-filled">
                {{ getStockData(props.row.stocks, date).stock }}
              </div>
            </template>
          </template>
        </b-table-column>
      </b-table>
    </template>
    <template v-else>
      <Loading :is-loading="isLoading" />
    </template>
    <!-- End For List Data Stock -->
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { formatDate, showToast } from "@/services/util";
import moment from "moment";
import Loading from "@/components/Loading";
import debounce from "lodash/debounce";

export default {
  name: "stock",
  components: {
    Loading,
  },
  data() {
    return {
      file: null,
      isZeroStock: false,
      isLoading: false,
      dates: [
        new Date(moment().startOf("month")),
        new Date(moment().endOf("month")),
      ],
      dateRange: [],
      fromDate: new Date(moment().startOf("month")),
      toDate: new Date(moment().endOf("month")),

      filterBy: 'dealer',
      isPaginated: true,
      isPaginationSimple: false,
      paginationPosition: "bottom",
      defaultSortDirection: "asc",
      defaultSortOrder: "desc",
      sortIcon: "arrow-up",
      sortIconSize: "is-small",
      currentPage: 1,
      perPage: 10,
      activeTab: 0,
      sortField: "id",
      sortOrder: "desc",
      stickyHeaders: true,
      isBordered: true,
      page: 1,
      search: null,
    };
  },
  async created() {
    this.dateRange = this.generateDateRange(this.fromDate, this.toDate);

    await this.loadStocks(
      this.perPage,
      this.page,
      this.sortField,
      this.sortOrder,
      this.search,
      this.fromDate,
      this.toDate,
      this.filterBy,
      this.isZeroStock,
    );
  },
  methods: {
    ...mapActions({
      fetchStocks: "stock/fetchStocks",
      importStock: "stock/importStock",
    }),

    // For generate range date
    generateDateRange(fromDate, toDate) {
      let dateRange = [];
      let startDate = moment(fromDate);
      let iterator = moment(fromDate);
      let endDate = moment(toDate);
      dateRange.push(startDate.format("YYYY-MM-DD"));
      while (iterator.format("YYYY-MM-DD") < endDate.format("YYYY-MM-DD")) {
        dateRange.push(iterator.add(1, "days").format("YYYY-MM-DD"));
      }

      return dateRange;
    },

    // For format date
    formatDate(date, format) {
      return formatDate(date, format);
    },

    // For get stock
    getStockData(stocks, date) {
      if (stocks.length > 0) {
        let result = stocks.filter((element) => element.date === date);

        if (result.length === 0) {
          return null;
        }

        return result[0];
      }
    },

    // For search stock
    searchStock: debounce(function (value) {
      if (value) {
        this.search = value;
        this.loadStocks(
          this.perPage,
          this.page,
          this.sortField,
          this.sortOrder,
          this.search,
          this.fromDate,
          this.toDate,
          this.filterBy,
          this.isZeroStock,
        );
      } else {
        this.search = null;
        this.loadStocks(
          this.perPage,
          this.page,
          this.sortField,
          this.sortOrder,
          this.search,
          this.fromDate,
          this.toDate,
          this.filterBy,
          this.isZeroStock,
        );
      }
    }, 500),

    // For load students
    async loadStocks(
      perPage,
      page,
      sortField,
      sortOrder,
      search,
      fromDate,
      toDate,
      filterBy,
      isZeroStock
    ) {
      let data = {
        perPage: perPage,
        page: page,
        sortField: sortField,
        sortOrder: sortOrder,
        search: search,
        fromDate: fromDate,
        toDate: toDate,
        filterBy: filterBy,
        isZeroStock: isZeroStock,
      };

      this.isLoading = true;
      try {
        await this.fetchStocks(data);
      } catch (err) {
        showToast(err, "is-danger", "is-bottom");
      }
      this.isLoading = false;
    },

    // For Page Change
    onPageChange(page) {
      this.currentPage = page;
      this.page = page;
      this.loadStocks(
        this.perPage,
        this.page,
        this.sortField,
        this.sortOrder,
        this.search,
        this.fromDate,
        this.toDate,
        this.filterBy,
        this.isZeroStock,
      );
    },

    // For Sorting Data
    onSort(field, order) {
      this.sortField = field;
      this.sortOrder = order;
      this.loadStocks(
        this.perPage,
        this.page,
        this.sortField,
        this.sortOrder,
        this.search,
        this.fromDate,
        this.toDate,
        this.filterBy,
        this.isZeroStock,
      );
    },

    // For per page change
    onPerPageChange(value) {
      this.perPage = value;
      this.loadStocks(
        this.perPage,
        this.page,
        this.sortField,
        this.sortOrder,
        this.search,
        this.fromDate,
        this.toDate,
        this.filterBy,
        this.isZeroStock,
      );
    },

    async importExcel() {
      let data = {
        file: this.file,
      };

      try {
        await this.importStock(data);

        showToast("Import Sukses", "is-success", "is-bottom");
      } catch (err) {
        showToast(err, "is-danger", "is-bottom");
      }
    },
  },
  computed: {
    ...mapGetters({
      stocks: "stock/getStocks",
    }),
  },
  watch: {
    search: function (val) {
      this.searchStock(val);
    },
    dates: function (val) {
      this.fromDate = new Date(val[0]);
      this.toDate = new Date(val[1]);
      this.loadStocks(
        this.perPage,
        this.page,
        this.sortField,
        this.sortOrder,
        this.search,
        this.fromDate,
        this.toDate,
        this.filterBy,
        this.isZeroStock,
      );
      this.dateRange = this.generateDateRange(val[0], val[1]);
    },
    isZeroStock: function () {
      this.loadStocks(
        this.perPage,
        this.page,
        this.sortField,
        this.sortOrder,
        this.search,
        this.fromDate,
        this.toDate,
        this.filterBy,
        this.isZeroStock,
      );
    }
  },
};
</script>

<style lang="scss">
.product {
  &-zero {
    background-color: #bebbbb;
    color: #707070;
    text-align: center;
    border-radius: 4px;
  }

  &-filled {
    background-color: #82d142;
    color: #106405;
    text-align: center;
    border-radius: 4px;
  }
}
</style>